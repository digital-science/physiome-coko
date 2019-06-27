const { models } = require('component-workflow-model/model');
const { Submission } = models;

const express = require('express');
const bodyParser = require('body-parser');

const { ConflictError, AuthorizationError, NotFoundError } = require('@pubsweet/errors');
const logger = require("workflow-utils/logger-with-prefix")('stripe-apc-service');
const { transaction } = require('objection');

const stripe = require('./Stripe');
const config = require('config');



const SubmissionCheckoutStatus = {
    Success: "Success",
    AlreadyPaid: "AlreadyPaid"
};


const CHECK_SESSION_RESULT_INVALID = 'invalid';
const CHECK_SESSION_RESULT_VALID = 'valid';
const CHECK_SESSION_RESULT_PAID = 'paid';


async function checkCheckoutSession(checkoutSessionId) {

    return stripe.checkout.sessions.retrieve(checkoutSessionId).catch(err => {

        // If the checkout session can't be found, then the checkout session is considered invalid.
        if(err.statusCode === 404) {
            return CHECK_SESSION_RESULT_INVALID;
        }

        logger.error("retrieval of checkout submission from Stripe failed due to: " + err.toString());
        return Promise.reject(err);

    }).then(session => {

        return stripe.paymentIntents.retrieve(session.payment_intent);

    }).then(paymentIntention => {

        // If the payment intention is 'succeeded', then this checkout session was successfully completed.
        if(paymentIntention.status === 'succeeded') {
            return CHECK_SESSION_RESULT_PAID;
        }

        // If the payment intention is canceled, then the checkout session itself is no longer valid.
        if(paymentIntention.status === 'canceled') {
            return CHECK_SESSION_RESULT_INVALID;
        }

        return CHECK_SESSION_RESULT_VALID;

    }).catch(err => {

        if(err.statusCode === 404) {
            return CHECK_SESSION_RESULT_INVALID;
        }

        logger.error("retrieval of checkout submission from Stripe failed due to: " + err.toString());
        return Promise.reject(err);
    });
}


async function createCheckoutSession(submissionId, emailAddress = null) {

    const checkoutDetails = {
        client_reference_id: `${submissionId}`,
        success_url: `${config.get('pubsweet-client.baseUrl')}/payment/${encodeURI(submissionId)}/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${config.get('pubsweet-client.baseUrl')}/payment/${encodeURI(submissionId)}cancel?session_id={CHECKOUT_SESSION_ID}`,
        payment_method_types: ["card"],
        submit_type: "pay",
        line_items: [{
            name: "Physiome Journal APC",
            description: "Physiome Journal article processing fee",
            amount: 30000,
            currency: "usd",
            quantity: 1
        }]
    };

    if(emailAddress) {
        checkoutDetails.customer_email = emailAddress;
    }

    return stripe.checkout.sessions.create(checkoutDetails);
}




exports.generateCheckoutSessionForSubmission = async function generateCheckoutSessionForSubmission(submissionId) {

    const submission = await Submission.find(submissionId);

    // If the payment has already been completed then we don't generate a new checkout submission.
    if(submission.paymentCompleted === true) {
        logger.debug(`new checkout session requested on already paid submission (submissionId = ${submissionId}) `);
        return {status:SubmissionCheckoutStatus.AlreadyPaid};
    }

    const currentSessionValid = submission.paymentSessionId ? checkCheckoutSession(submission.paymentSessionId) : Promise.resolve(CHECK_SESSION_RESULT_INVALID);
    const originalSubmissionId = submission.paymentSessionId;

    return currentSessionValid.then(checkSessionResult => {

        // If the checkout session is still valid, we re-use it again for the user.
        if(checkSessionResult === CHECK_SESSION_RESULT_VALID) {
            logger.debug(`checkout session for submission was still valid (and not paid), returning existing checkout session (submissionId = ${submissionId}) `);
            return {status:SubmissionCheckoutStatus.Success, sessionId:submission.paymentSessionId};
        }

        // If the submission has already been paid, then we return that fact to the client (allowing them to refresh the data on the page for example).
        if(checkSessionResult === CHECK_SESSION_RESULT_PAID) {
            logger.debug(`checkout session for submission was still valid but was already paid, returning 'already paid' status to client (submissionId = ${submissionId}) `);
            return {status:SubmissionCheckoutStatus.AlreadyPaid};
        }


        // Otherwise, we need to create a new session. After creating the new session we need to ensure that the same payment session we started with
        // is still in place.

        return createCheckoutSession(submissionId).then(async session => {

            logger.debug(`received new checkout session via Stripe API (submissionId = ${submissionId}, sessionId = ${session.id}) `);

            submission.paymentSessionId = session.id;

            try {

                const r = await submission.patchRestrictingOnFields(['paymentSessionId'], {
                    paymentSessionId: originalSubmissionId
                });

                // If we can't update the submission with the new checkout session id, then we return a conflict error.
                if(!r) {
                    logger.error("unable to update submission with new check session id due to conflict during update");
                    return Promise.reject(new ConflictError('Conflicting checkout session created during creation of checkout session.'));
                }

            } catch(e) {

                logger.error(e);
                throw e;
            }

            logger.debug(`successfully saved checkout session to submission, returning status of success to client (submissionId = ${submissionId}, sessionId = ${session.id}) `);
            return {status:SubmissionCheckoutStatus.Success, sessionId:session.id};
        });

    });
};



function _retrieveCheckoutSessionAndPaymentIntentForSessionId(checkoutSessionId) {

    return stripe.checkout.sessions.retrieve(checkoutSessionId).catch(err => {

        if(err.statusCode === 404) {
            return null;
        }

        logger.error("Retrieval of checkout submission from Stripe failed due to: " + err.toString());
        return Promise.reject(err);

    }).then(session => {

        return stripe.paymentIntents.retrieve(session.payment_intent).then(paymentIntention => {

            return {session, paymentIntention};

        }).catch(err => {

            if(err.statusCode === 404) {
                return {session, paymentIntention:null};
            }

            logger.error("Retrieval of checkout submission from Stripe failed due to: " + err.toString());
            return Promise.reject(err);
        });
    });

}


async function processSuccessfulPayment(submissionId, checkoutSessionId) {

    const p = Promise.all([
        _retrieveCheckoutSessionAndPaymentIntentForSessionId(checkoutSessionId),
        Submission.find(submissionId)
    ]);

    return p.then(async ([checkoutDetails, submission]) => {

        if(!submission) {
            logger.error(`processing successful payment, unable to find submission (submissionId=${submissionId}, sessionId=${checkoutSessionId})`);
            return false;
        }

        if(submission.paymentCompleted === true) {
            logger.info(`processing successful payment, submission already marked as paid (submissionId=${submissionId}, sessionId=${checkoutSessionId})`);
            return false;
        }

        if(submission.paymentSessionId !== checkoutSessionId) {
            logger.info(`processing successful payment, submission checkout session id doesn't match supplied session id `
                                + `(submissionId=${submissionId}, sessionId=${checkoutSessionId}), submission-sessionId=${submission.paymentSessionId}`);
            return false;
        }

        if(!checkoutDetails) {
            logger.error(`processing successful payment, checkout session was not found (submissionId=${submissionId}, sessionId=${checkoutSessionId})`);
            return false;
        }

        const { session, paymentIntention } = checkoutDetails;

        if(session.client_reference_id !== submissionId) {
            logger.error(`processing successful payment, checkout session client ref doesn't match submission (submissionId=${submissionId}, sessionId=${checkoutSessionId})`);
            return false;
        }

        if(!paymentIntention) {
            logger.error(`processing successful payment, payment intention was not found (submissionId=${submissionId}, sessionId=${checkoutSessionId})`);
            return false;
        }

        if(paymentIntention.status !== 'succeeded') {
            logger.error(`processing successful payment, payment intention status was not 'succeeded' ` +
                                `(submissionId=${submissionId}, sessionId=${checkoutSessionId}, status=${paymentIntention.status})`);
            return false;
        }



        // FIXME: apply a "livemode" check depending on the environment??

        submission.paymentCompleted = true;


        // Update the submission, marking it as having the payment being completed. The only update requirement is that the payment session id
        // still matches with what we've been processing against.

        return new Promise(async (resolve, reject) => {

            try {

                // FIXME: do we want to have a retry attempt here, with some sort of back-off applied

                const updatedSubmission = await submission.patchRestrictingOnFields(['paymentCompleted'], {
                    paymentSessionId: checkoutSessionId
                });

                // If we can't update the submission with the new checkout session id, then we return a conflict error.
                if(!updatedSubmission) {
                    logger.error("unable to update submission with successful payment flag due to conflict during update");
                    return reject(new ConflictError('Conflict issue patching submission with successful payment flag.'));
                }

                return resolve(updatedSubmission);

            } catch(err) {

                logger.error(`processing successful payment, unable to patch submission with successful payment flag applied due to: ` + err);
                return reject(err);
            }

        }).then(submission => {

            return submission.tasksForInstance().then(async tasks => {

                const matchingTasks = tasks.filter(t => t.formKey === "custom:payment");
                if(!matchingTasks.length) {
                    return false;
                }

                const taskId = matchingTasks[0].id;
                const originalPhase = submission.phase;
                const stateChange = {
                    phase: "paid"
                };

                submission.phase = 'paid';

                const trx = await transaction.start(Submission.knex());

                return Promise.all([

                    submission.patchRestrictingOnFields(['phase'], {
                        phase: originalPhase
                    }).catch(e => {
                        logger.error(`processing successful payment, patch phase failed due to: ${e.toString()}`);
                        return Promise.reject(e);
                    }),

                    submission.completeTaskForInstance(taskId, stateChange).catch(e => {
                        logger.error(`processing successful payment, complete task failed due to: ${e.toString()}`);
                        return Promise.reject(e);
                    })

                ]).then(async completed => {

                    try {
                        await trx.commit();
                    } catch(e) {
                        logger.error(`processing successful payment, committing submission update transaction failed due to : ${e.toString()}`);
                        return Promise.reject(err);
                    }

                }).catch(async err => {

                    await trx.rollback();
                    return Promise.reject(err);
                });

            }).then(r => {

                return true;
            });

        })
    });
}


exports.handleSuccessUrl = function handleSuccessUrl(request, response) {

    const { submissionId } = request.params;
    const checkoutSessionId = request.query['session_id'];

    if(!submissionId) {
        logger.error("payment success handler failed, no submission id present");
        return response.status(400).send("Invalid Request");
    }

    if(!checkoutSessionId) {
        logger.error("payment success handler failed, no checkout session id present");
        return response.status(400).send("Invalid Request");
    }

    processSuccessfulPayment(submissionId, checkoutSessionId).then(() => {

        return response.redirect(302, `/details/${encodeURI(submissionId)}`);

    }).catch(err => {

        return response.status(500).send("Server Error");
    })

};




exports.handleCancelUrl = function() {


};



exports.registerCheckoutCompletedWebhookHandler = (app, urlPath = '/payments/webhooks') => {

    const webhookSecret = config.get('stripe.webhookSecretKey');

    app.post(urlPath, bodyParser.raw({type: 'application/json'}), (request, response) => {

        const sig = request.headers['stripe-signature'];
        let event;

        try {
            event = stripe.webhooks.constructEvent(request.body, sig, webhookSecret);
        } catch (err) {
            return response.status(400).send(`Webhook Error: ${err.message}`);
        }

        if (event.type === 'checkout.session.completed') {

            logger.debug(`starting handling of Stripe webhook event: checkout.session.completed`);

            const session = event.data.object;

            console.log(JSON.stringify(session, null, 4));

            // Fulfill the purchase...
            //handleCheckoutSession(session);

            return response.json({received: true});
        }

        return response.status(400).send(`Unknown webhook event type received.`);
    });

    if(!app._router || !app._router.stack || !app._router.stack.length || app._router.stack.length < 3) {
        logger.error(`register webhook failed, unable to access express router stack to modify ordering`);
        process.exit(1);
        return;
    }

    const layer = app._router.stack.pop();
    app._router.stack.splice(2, 0, layer);
};