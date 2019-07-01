const { ServiceSendEmail, EmailTemplate } = require('component-workflow-send-email');

module.exports = function generateEmailSender(templateName) {

    const emailTemplate = new EmailTemplate(templateName);

    return (identity, subject, data) => {

        const text = emailTemplate.template(data);
        const to = `${identity.displayName} <${identity.email}>`;

        const opts = {
            subject,
            to,
            text
        };

        return ServiceSendEmail.sendEmail(opts);
    }
};