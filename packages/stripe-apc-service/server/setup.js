const { handleSuccessUrl, handleCancelUrl, registerCheckoutCompletedWebhookHandler } = require('./SubmissionPaymentHandling');

module.exports = (app) => {

    app.get("/payment/:submissionId/success", handleSuccessUrl);
    app.get("/payment/:submissionId/cancel", handleCancelUrl);

    registerCheckoutCompletedWebhookHandler(app);

    return Promise.resolve();
};