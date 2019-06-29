const { BaseModel } = require('component-model');


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

                tokens: { type:['object', 'null'] },
                groups: { type:['object', 'null'] },

                lastLoginDate: { type:['string', 'object', 'null'], format:'date-time' }
            }
        };
    }
}


exports.resolvers = {
    IdentityType: {
        ORCiDIdentityType: "orcid"
    }
};


exports.model = exports.Identity = Identity;
