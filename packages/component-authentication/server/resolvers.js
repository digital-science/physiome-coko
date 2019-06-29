const { models } = require('component-workflow-model/model');
const { Identity } = models;
const config = require('config');

async function lookupIdentity(userId) {
    return await Identity.findOneByField('id', userId);
}

module.exports = {

    Query: {

        currentUser: (instance, args, context, info) => {

            if(!context.user) {
                return null;
            }

            return lookupIdentity(context.user).then(identity => {

                if(!identity) {
                    return null;
                }

                const r = {
                    id:identity.id,
                    username:identity.displayName,
                    groups:["administrator"],  // FIXME: hard-coded for testing purposes currently

                    email:identity.email,
                    emailIsValidated:!!identity.emailIsValidated,
                    hasPendingEmailValidation: false
                };

                if(!r.emailIsValidated && identity.emailValidationToken && identity.emailValidationTokenExpire) {

                    const expireDate = new Date(identity.emailValidationTokenExpire);
                    const currentDate = new Date();

                    r.hasPendingValidation = currentDate.getTime() < expireDate.getTime();
                    r.emailValidationTokenExpire = identity.emailValidationTokenExpire;

                } else {

                    r.emailValidationTokenExpire = null;
                }

                return r;
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
                identity.isValidatedEmail = false;
                identity.emailValidationToken = `${Math.floor(100000 + Math.random() * 900000)}`;
                identity.emailValidationTokenExpire = new Date((new Date()).getTime() + (config.get('identity.validationTokenExpireDays') || 15) * 86400000 );

                await identity.save();

                // send an email off which has a link included for the token...

                return false;
            });
        }
    }
};