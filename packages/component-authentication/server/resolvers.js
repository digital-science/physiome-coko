const { models } = require('component-workflow-model/model');
const { Identity } = models;

const { createEmailValidationForIdentity, TooManyValidationEmailsSentError } = require('./emailValidation');


async function lookupIdentity(userId) {
    return await Identity.findOneByField('id', userId);
}

const CurrentUserEmailValidationOutcome = {
    Successful: 'Successful',
    InvalidToken: 'InvalidToken',
    ExpiredToken: 'ExpiredToken'
};

const CurrentUserEmailConfirmationOutcome = {
    NoUserLoggedIn: 'NoUserLoggedIn',
    AlreadyConfirmed: 'AlreadyConfirmed',
    InvalidEmailAddress: 'InvalidEmailAddress',
    ValidationSent: 'ValidationSent',
    TooManyValidationAttempts: 'TooManyValidationAttempts'
};

const MinimalEmailRegex = /^\S+@\S+$/;


module.exports = {

    Query: {

        currentUser: (instance, args, context, info) => {

            if(!context.user) {
                return null;
            }

            return lookupIdentity(context.user).then(async identity => {

                if(!identity) {
                    return null;
                }

                let emailValidationTokenOutcome = null;
                const user = {
                    id:identity.id,
                    username:identity.displayName,
                    groups: identity.finalisedAccessGroups,

                    email:identity.email,
                    emailIsValidated:!!identity.isValidatedEmail,
                    hasPendingEmailValidation: false
                };

                if(!user.emailIsValidated && identity.emailValidationToken && identity.emailValidationTokenExpire) {

                    const expireDate = new Date(identity.emailValidationTokenExpire);
                    const currentDate = new Date();

                    user.hasPendingValidation = currentDate.getTime() < expireDate.getTime();
                    user.emailValidationTokenExpire = identity.emailValidationTokenExpire;

                } else {

                    user.emailValidationTokenExpire = null;
                }

                const { emailValidationToken } = args;

                if(user.emailIsValidated !== true && emailValidationToken && emailValidationToken.length
                    && typeof emailValidationToken === 'string' && emailValidationToken.match(/^[0-9]+$/)) {

                    if(`${identity.emailValidationToken}` === emailValidationToken) {

                        if(user.hasPendingValidation) {

                            user.emailIsValidated = true;
                            user.hasPendingValidation = false;

                            identity.isValidatedEmail = true;
                            identity.emailValidationToken = null;
                            identity.emailValidationTokenExpire = null;

                            await identity.save();

                            // Notify other clients that the identity was updated (will force a current user refresh).
                            identity.publishIdentityWasModified();

                            emailValidationTokenOutcome = CurrentUserEmailValidationOutcome.Successful;

                        } else {

                            emailValidationTokenOutcome = CurrentUserEmailValidationOutcome.ExpiredToken;
                        }

                    } else {

                        emailValidationTokenOutcome = CurrentUserEmailValidationOutcome.InvalidToken;
                    }
                }

                return {user, emailValidationTokenOutcome};
            });
        }
    },

    Mutation: {

        confirmCurrentUserEmail: async (instance, args, context, info) => {

            if(!args.email) {
                return CurrentUserEmailConfirmationOutcome.InvalidEmailAddress;
            }

            return confirmUserEmailAddress(context.user, args.email);
        },

        resendCurrentUserEmailValidation: async (instance, args, context, info) => {

            return confirmUserEmailAddress(context.user);
        }
    }
};




function confirmUserEmailAddress(user, newEmailAddress = null) {

    if(!user) {
        return CurrentUserEmailConfirmationOutcome.NoUserLoggedIn;
    }

    return lookupIdentity(user).then(async identity => {

        // If the user already has a confirmed email address we apply a different process depending on
        // if the user has requested a re-send or provided a new email address.

        if(identity.isValidatedEmail) {

            if(!newEmailAddress && identity.email) {
                return CurrentUserEmailConfirmationOutcome.AlreadyConfirmed;
            }

            if(newEmailAddress && identity.email === newEmailAddress) {
                return CurrentUserEmailConfirmationOutcome.AlreadyConfirmed;
            }
        }

        // If the user is setting a  new email address and it doesn't match the minimal regex, reject it.
        if(newEmailAddress) {

            if(!(newEmailAddress.match(MinimalEmailRegex))) {
                return CurrentUserEmailConfirmationOutcome.InvalidEmailAddress;
            }

            identity.email = newEmailAddress;
        }

        return createEmailValidationForIdentity(identity, !newEmailAddress).then(r => {

            return CurrentUserEmailConfirmationOutcome.ValidationSent;

        }).catch(err => {

            if(err instanceof TooManyValidationEmailsSentError) {
                return CurrentUserEmailConfirmationOutcome.TooManyValidationAttempts;
            }

            return Promise.reject(err);
        });
    });


}
