const { Identity } = require('../shared-model/identity');


function userIdentityIdForContext(context) {

    return context ? context.user : null;
}


async function resolveUserForContext(context) {

    if(!context || !context.user) {
        return null;
    }

    if(context.resolvedUser) {
        return context.resolvedUser;
    }

    return Identity.find(context.user).then((user) => {
        context.resolvedUser = user;
        return user;
    });
}


exports.userIdentityIdForContext = userIdentityIdForContext;
exports.resolveUserForContext = resolveUserForContext;