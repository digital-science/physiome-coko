const { generateCheckoutSessionForSubmission } = require('./SubmissionPaymentHandling');
const logger = require("workflow-utils/logger-with-prefix")('stripe-apc-service');

const { AuthorizationError, NotFoundError } = require('@pubsweet/errors');

const { models } = require('component-workflow-model/model');
const { resolveUserForContext } = require('component-workflow-model/shared-helpers/access');

const { Submission } = models;


module.exports = () => {

    return {
        Query: {

            checkoutSessionForSubmission: async (ctxt, { submissionId }, context, info) => {

                const [submission, user] = await Promise.all([
                    Submission.find(submissionId),
                    resolveUserForContext(context)
                ]);

                if(!user) {
                    return Promise.reject(new AuthorizationError("No current user authenticated."));
                }

                if(!submission) {
                    logger.debug(`unable to find submission to create checkout session (submissionId = ${submissionId}) `);
                    throw new NotFoundError('Submission was not found');
                }

                // Note: generateCheckoutSessionForSubmission performs ACL checking to ensure user is allowed to generate a checkout session.

                return generateCheckoutSessionForSubmission(submission, user).catch(err => {
                    logger.error("checkoutSessionForSubmission failed due to: " + err.toString());
                    return Promise.reject(err);
                });
            }

        }
    }
};