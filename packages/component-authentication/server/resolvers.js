const { models } = require('component-workflow-model/model');
const { Identity } = models;

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
                return {id:identity.id, username:identity.displayName};
            });
        }
    }
};