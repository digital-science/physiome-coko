const { BaseModel } = require('component-model');
const { pubsubManager } = require("pubsweet-server");

const { AuthorizationError } = require('@pubsweet/errors');


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
}

async function asyncIteratorWasModified(user) {

    if(!user) {
        return null;
    }

    const pubSub = await pubsubManager.getPubsub();
    return pubSub.asyncIterator(`identity.modified.${user}`);
}

exports.resolvers = {
    IdentityType: {
        ORCiDIdentityType: "orcid"
    },

    Subscription: {
        modifiedIdentity: {
            subscribe: async (_, input, context) => asyncIteratorWasModified(context.user)
        }
    }
};


exports.model = exports.Identity = Identity;
