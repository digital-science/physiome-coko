const { handleSuccessUrl } = require('./SubmissionPaymentHandling');

module.exports = (app) => {

    app.get("/payment/:submissionId/success", handleSuccessUrl);

    return Promise.resolve();
};