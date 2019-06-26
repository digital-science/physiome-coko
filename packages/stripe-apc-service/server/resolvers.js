const { generateCheckoutSessionForSubmission } = require('./SubmissionPaymentHandling');
const logger = require("workflow-utils/logger-with-prefix")('stripe-apc-service');

module.exports = () => {

    return {
        Query: {

            checkoutSessionForSubmission: (ctxt, input, context, info) => {

                // FIXME: check for user auth, user should have access to the submission in question

                const { submissionId } = input;

                return generateCheckoutSessionForSubmission(submissionId).catch(err => {
                    logger.error("checkoutSessionForSubmission failed due to: " + err.toString());
                    return Promise.reject(err);
                });
            }

        }
    }
};