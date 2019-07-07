const { ServiceSendEmail, EmailTemplate } = require('component-workflow-send-email');
const logger = require('workflow-utils/logger-with-prefix')('authentication/email-validation');
const config = require('config');

const EmailValidationEmailTemplate = new EmailTemplate('validate-email-address');

const MaximumEmailValidationAttemptsPerDay = config.get('identity.maximumEmailValidationsPerDay');
const MaximumEmailSendTimesArrayLength = Math.max(20, MaximumEmailValidationAttemptsPerDay * 2);

const EmailSignature = config.get('workflow-send-email.signature');

const MILLISECONDS_PER_DAY = 86400000;


class TooManyValidationEmailsSentError extends Error {
    constructor(...args) {
        super(...args);
        Error.captureStackTrace(this, TooManyValidationEmailsSentError)
    }
}

exports.TooManyValidationEmailsSentError = TooManyValidationEmailsSentError;


exports.createEmailValidationForIdentity = async function(identity, resend = false) {

    // For the identity we need to take a look at the last times we sent a validation email,
    // and check to see how many were sent within the last 24 hours. If this exceeds the maximum
    // number allowed within a 24 hour period, return an error.

    const currentDateTime = (new Date()).getTime();
    const currentDateTimeString = new Date(currentDateTime).toISOString();
    const oneDayAgo = new Date(currentDateTime - MILLISECONDS_PER_DAY);

    if(identity.emailValidationEmailSendTimes && identity.emailValidationEmailSendTimes instanceof Array && identity.emailValidationEmailSendTimes.length) {

        const emailsSentsLastDay = identity.emailValidationEmailSendTimes.filter(v => ((new Date(v)).getTime() >= oneDayAgo));

        if(emailsSentsLastDay.length >= MaximumEmailValidationAttemptsPerDay) {
            return Promise.reject(new TooManyValidationEmailsSentError('too many validation emails have been sent within the last 24 hours'));
        }
    }


    identity.isValidatedEmail = false;

    // If the user has requested re-sending the verification code, and the previously sent token is still valid, then
    // we want to re-use the same code again, but just update the expire time (essentially re-sending the email with a new
    // expiration time).

    if(resend && identity.emailValidationToken && identity.emailValidationTokenExpire && (new Date(identity.emailValidationTokenExpire)).getTime() <= currentDateTime) {
        identity.emailValidationToken = `${identity.emailValidationToken}`;
    } else {
        identity.emailValidationToken = `${Math.floor(100000 + Math.random() * 900000)}`;
    }

    identity.emailValidationTokenExpire = new Date(currentDateTime + (config.get('identity.validationTokenExpireDays') || 15) * MILLISECONDS_PER_DAY );
    identity.emailValidationEmailSendTimes = (identity.emailValidationEmailSendTimes ? [currentDateTimeString, ...identity.emailValidationEmailSendTimes] : [currentDateTimeString]).slice(0, MaximumEmailSendTimesArrayLength);

    await identity.save();

    // We now need to send an email off to the user as well

    const validationCode = `${identity.emailValidationToken}`;
    const validateLink = `${config.get('pubsweet-client.baseUrl')}/#email_code=${validationCode}`;

    const email = {
        to: `${identity.displayName} <${identity.email}>`,
        subject: "email address confirmation",
        text: EmailValidationEmailTemplate.template({user:identity, validateLink, validationCode, signature:EmailSignature})
    };
    
    // Note: email is sent async
    const sendEmail = ServiceSendEmail.sendEmail(email).catch(err => {

        logger.error(`sending email to '${identity.displayName} (${identity.email})' for email validation failed due to: ${err.toString()}`);
    });

    return {sendEmailResult:sendEmail};
};