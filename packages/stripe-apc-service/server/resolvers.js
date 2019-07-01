const { generateCheckoutSessionForSubmission } = require('./SubmissionPaymentHandling');
const logger = require("workflow-utils/logger-with-prefix")('stripe-apc-service');

const { AuthorizationError } = require('@pubsweet/errors');

const { models } = require('component-workflow-model/model');
const { Identity } = models;


module.exports = () => {

    return {
        Query: {

            checkoutSessionForSubmission: (ctxt, input, context, info) => {

                // FIXME: check for user auth, user should have access to the submission in question
                const { submissionId } = input;

                return Identity.find(context.user).then(user => {

                    if(!user) {
                        return Promise.reject(new AuthorizationError("No current user authenticated."));
                    }

                    return generateCheckoutSessionForSubmission(submissionId, user).catch(err => {
                        logger.error("checkoutSessionForSubmission failed due to: " + err.toString());
                        return Promise.reject(err);
                    });
                });

            }

        }
    }
};