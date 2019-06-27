const { handleSuccessUrl, registerCheckoutCompletedWebhookHandler } = require('./SubmissionPaymentHandling');

module.exports = (app) => {

    app.get("/payment/:submissionId/success", handleSuccessUrl);
    registerCheckoutCompletedWebhookHandler(app);

    return Promise.resolve();
};