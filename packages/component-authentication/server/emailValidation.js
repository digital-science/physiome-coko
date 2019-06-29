const { ServiceSendEmail, EmailTemplate } = require('component-workflow-send-email');
const logger = require('workflow-utils/logger-with-prefix')('authentication/email-validation');
const config = require('config');

const EmailValidationEmailTemplate = new EmailTemplate('validate-email-address');


exports.createEmailValidationForIdentity = async function(identity) {

    identity.isValidatedEmail = false;
    identity.emailValidationToken = `${Math.floor(100000 + Math.random() * 900000)}`;
    identity.emailValidationTokenExpire = new Date((new Date()).getTime() + (config.get('identity.validationTokenExpireDays') || 15) * 86400000 );

    await identity.save();

    // We now need to send an email off to the user as well

    const validateLink = `${config.get('pubsweet-client.baseUrl')}/#email_code=${identity.emailValidationToken}`;

    const email = {
        to: `${identity.displayName} <${identity.email}>`,
        subject: "Validate Email Address",
        text: EmailValidationEmailTemplate.template({user:identity, validateLink})
    };

    console.log("email to send >>");
    console.dir(email);

    // Note: email is sent async
    const sendEmail = ServiceSendEmail.sendEmail(email).catch(err => {

        logger.error(`sending email to '${identity.displayName} (${identity.email})' for email validation failed due to: ${err.toString()}`);
    });

    return {sendEmailResult:sendEmail};
};