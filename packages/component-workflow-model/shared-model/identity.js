const { BaseModel } = require('component-model');
const { pubsubManager } = require("pubsweet-server");
const config = require('config');

const GraphQLFields = require('graphql-fields');
const logger = require('workflow-utils/logger-with-prefix')('[workflow-model/identity]');


const AdminORCIDIdentities = config.get('identity.adminIdentities');


class Identity extends BaseModel {

    static get tableName() {
        return 'identity';
    }

    static get schema() {
        return {
            type:'object',
            properties: {
                type: { type: ['string', 'null'] },

                identityId: { type: ['string', 'null'] },
                displayName: { type: ['string', 'null'] },
                displayAffiliation: { type: ['string', 'null'] },

                email: { type: ['string', 'null'] },
                isValidatedEmail: { type: ['boolean', 'null'] },
                emailValidationToken: { type: ['string', 'null'] },
                emailValidationTokenExpire: { type:['string', 'object', 'null'], format:'date-time' },
                emailValidationEmailSendTimes: { type:['array', 'null'] },

                tokens: { type:['object', 'null'] },
                groups: { type:['object', 'null'] },

                lastLoginDate: { type:['string', 'object', 'null'], format:'date-time' }
            }
        };
    }

    async publishIdentityWasModified() {
        const pubSub = await pubsubManager.getPubsub();
        if (pubSub) {
            const r = {};
            r[`modifiedIdentity`] = this.id;
            pubSub.publish(`identity.modified.${this.id}`, r);
        }
    }

    get finalisedAccessGroups() {

        const groups = this.groups;
        if(groups && groups instanceof Array) {
            return groups;
        }

        return (this.identityId && AdminORCIDIdentities.indexOf(this.identityId) !== -1) ? ["administrator"] : [];
    }
}

async function asyncIteratorWasModified(user) {

    if(!user) {
        return null;
    }

    const pubSub = await pubsubManager.getPubsub();
    return pubSub.asyncIterator(`identity.modified.${user}`);
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


async function getIdentities(input, context, info) {

    // FIXME: apply user restrictions to looking up users, this will change depending on what group the user belongs to (ie. certain users in a role
    // maybe allowed to lookup a user within a specific set of roles etc)

    const user = await resolveUserForContext(context);

    const fieldsWithoutTypeName = GraphQLFields(info, {}, { excludedFields: ['__typename'] });
    const topLevelFields = (fieldsWithoutTypeName && fieldsWithoutTypeName.results) ? Object.keys(fieldsWithoutTypeName.results) : [];

    const limit = input.first || 200;
    const offset = input.offset || 0;
    const filter = input.filter;

    logger.debug(`identities (fields=${topLevelFields.length})`);


    let query = Identity.query();
    const knex = Identity.knex();

    query = query.select(topLevelFields).select(knex.raw('count(*) OVER() AS internal_full_count')).limit(limit).offset(offset);

    if(filter) {
        // correctly apply filtering !!!
    }

    query = query.skipUndefined();

    const r = await query;

    // For each result, we then apply read ACL rules to it, ensuring only the allowed fields are returned for each instance.
    const totalCount = (r && r.length ? r[0].internalFullCount : 0);

    return {
        results:r,
        pageInfo: {
            totalCount,
            offset,
            pageSize: limit
        }
    };
}



exports.resolvers = {

    IdentityType: {
        ORCiDIdentityType: "orcid"
    },

    Query: {
        identities: async (ctxt, input, context, info) => {
            return getIdentities(input, context, info);
        }
    },

    Subscription: {
        modifiedIdentity: {
            subscribe: async (_, input, context) => asyncIteratorWasModified(context.user)
        }
    }
};


exports.model = exports.Identity = Identity;
