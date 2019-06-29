const { models } = require('component-workflow-model/model');
const { Identity } = models;
const config = require('config');

const { createEmailValidationForIdentity } = require('./emailValidation');

async function lookupIdentity(userId) {
    return await Identity.findOneByField('id', userId);
}

const CurrentUserEmailValidationOutcome = {
    Successful: 'Successful',
    InvalidToken: 'InvalidToken',
    ExpiredToken: 'ExpiredToken'
};



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

                console.dir(identity);


                let emailValidationTokenOutcome = null;
                const user = {
                    id:identity.id,
                    username:identity.displayName,
                    groups:["administrator"],  // FIXME: hard-coded for testing purposes currently

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

                            emailValidationTokenOutcome = CurrentUserEmailValidationOutcome.Successful;

                        } else {

                            // What do we do in this situation, automatically create a new token and re-send it?
                            emailValidationTokenOutcome = CurrentUserEmailValidationOutcome.ExpiredToken;
                            await createEmailValidationForIdentity(identity);
                        }

                    } else {

                        emailValidationTokenOutcome = CurrentUserEmailValidationOutcome.InvalidToken;
                        await createEmailValidationForIdentity(identity);
                    }
                }

                return {user, emailValidationTokenOutcome};
            });
        }
    },

    Mutation: {

        confirmCurrentUserEmail: async (instance, args, context, info) => {

            if(!context.user) {
                return false;
            }

            return lookupIdentity(context.user).then(async identity => {

                if(identity.email === args.email) {
                    return false;
                }

                identity.email = args.email;
                await createEmailValidationForIdentity(identity);
                return true;
            });
        }
    }
};