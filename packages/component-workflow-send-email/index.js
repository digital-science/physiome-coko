const EmailService = require('./service-send-email');
const EmailTemplate = require('./email-template');

const ServiceSendEmail = new EmailService();

exports.EmailTemplate = EmailTemplate;
exports.EmailService = EmailService;

exports.ServiceSendEmail = ServiceSendEmail;
