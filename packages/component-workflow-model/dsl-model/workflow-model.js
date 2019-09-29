const { BaseModel } = require('component-model');
const { pubsubManager } = require("pubsweet-server");

const GraphQLHelper = require('./graphql-helper');
const { lookupModel } = require('./model-registry');

const _Tab = GraphQLHelper.Tab;


class WorkflowModel extends BaseModel {

    constructor() {
        super();
    }

    // Note: implementation need to override these methods and provide
    // the correct model definitions and ACL sets.

    static get workflowDescription() {
        return null;
    }

    static get modelDefinition() {
        return null;
    }

    static get implementationName() {
        return this.modelDefinition.name;
    }

    static get graphQLModelName() {
        return this.modelDefinition.name;
    }

    static get listingAccessorName() {
        return this.implementationName;
    }

    static get aclSet() {
        return null;
    }

    static get modelExtensions() {
        return null;
    }


    // Return the GraphQL resolvers.
    static graphQLResolvers() {

        const workflowDef = this.workflowDescription;
        const model = this.modelDefinition;
        const implementationName = this.implementationName;
        const ModelClass = this;


        // Query
        // ---
        const queries = {};

        queries[`get${implementationName}`] = async function(ctxt, input, context, info) {
            return ModelClass.getQueryEndpoint(ctxt, input, context, info);
        };

        queries[this.listingAccessorName] = async function(ctxt, input, context, info) {
            return ModelClass.listingQueryEndpoint(ctxt, input, context, info);
        };


        // Field Resolvers
        // ---
        const fieldResolvers = {};
        const relationFields = model.relationFields(workflowDef);

        if(relationFields && relationFields.length) {

            relationFields.forEach(field => {
                fieldResolvers[f.field] = async (ctxt, input, context, info) => {
                    // FIXME: relation resolutions will need to have ACL applied to it as well
                    return ModelClass.relationResolverImplementation(ctxt, input, context, info, field);
                };
            });
        }

        // Subscriptions
        // ---
        const subscription = {};
        subscription[`created${implementationName}`] = {
            subscribe: async (_, vars, context) => ModelClass.asyncIteratorModelWasCreated()
        };
        subscription[`modified${implementationName}`] = {
            subscribe: async (_, vars, context) => ModelClass.asyncIteratorModelWasModified()
        };


        const r = {
            Mutation: {},
            Query: queries,
            Subscription: subscription
        };

        if(relationFields && relationFields.length) {
            r[implementationName] = fieldResolvers;
        }

        return r;
    }


    // Implementations for each specific GraphQL resolver
    static async getQueryEndpoint(ctxt, input, context, info) {


    }

    static async listingQueryEndpoint(ctxt, input, context, info) {


    }

    static async relationResolverImplementation(ctxt, input, context, info, field) {


    }



    // PubSub related
    // ---

    async publishWasCreated(model) {

        const ModelClass = model.constructor;
        const pubSub = await pubsubManager.getPubsub();

        if(pubSub) {
            const r = {};
            r[`created${ModelClass.implementationName}`] = model.id;
            pubSub.publish(`${ModelClass.implementationName}.created`, r);
        }
    };

    async publishWasModified(model) {

        const ModelClass = model.constructor;
        const pubSub = await pubsubManager.getPubsub();

        if(pubSub) {
            const r = {};
            r[`modified${ModelClass.implementationName}`] = model.id;
            pubSub.publish(`${ModelClass.implementationName}.updated`, r);
        }
    };


    static async asyncIteratorModelWasCreated() {

        const pubSub = await pubsubManager.getPubsub();
        return pubSub.asyncIterator(`${this.implementationName}.created`);
    };

    static async asyncIteratorModelWasModified() {

        const pubSub = await pubsubManager.getPubsub();
        return pubSub.asyncIterator(`${this.implementationName}.updated`);
    };



    // ORM helpers
    // ---

    static get tableName() {
        return this.tableNameForEntityName(this.implementationName);
    }

    static get schema() {

        if(this._cachedSchema) {
            return this._cachedSchema;
        }

        const { enums } = this.workflowDescription;
        const model = this.modelDefinition;

        const props = model.fields.map(element => {

            // FIXME: this should be more generalised into a generic lookup table or something of that sort of nature (this current impl smells a little)

            if(element.type === "String") {
                return {key:element.field, value:{type:['string', 'null']}};
            } else if(element.type === "Integer") {
                return {key:element.field, value:{type:['integer', 'null']}};
            } else if(element.type === "ID") {
                return {key:element.field, value:{type:['string', 'null'], format:'uuid'}};
            } else if(element.type === "DateTime") {
                return {key:element.field, value:{type:['string', 'object', 'null'], format:'date-time'}}; // 'object' allows the Date type
            } else if(element.type === "JSON") {
                return {key:element.field, value:{type:['object', 'array', 'null']}};
            } else if(element.type === "Boolean") {
                return {key:element.field, value:{type:['boolean', 'null']}};
            }

            // See if the element type is defined as an enum and then use that as the defined type.
            if(enums.hasOwnProperty(element.type)) {
                const values = Object.values(enums[element.type].values);
                values.push(null);

                return {
                    key:element.field,
                    value:{
                        type: ['string', 'null'],
                        enum: values
                    }
                };

            } else if(element.array !== true && element.joinField) {

                return {key:element.joinField, value:{type:['string', 'null'], format:'uuid'}};
            }

            return null;

        }).filter(e => !!e);

        const properties = {};
        props.forEach(p => {
            properties[p.key] = p.value;
        });

        this._cachedSchema = {
            type:'object',
            properties
        };
        return this._cachedSchema;
    }


    static get relationMappings() {

        if(this._cachedRelationMapping) {
            return this._cachedRelationMapping;
        }

        const name = this.implementationName;
        const model = this.modelDefinition;
        const relations = model.relationFields(this.workflowDescription);
        const tableName = this.tableName;

        if(!relations || !relations.length) {
            this._cachedRelationMapping = {};
            return this._cachedRelationMapping;
        }


        // Note: relation mapping generation is delayed to ensure that model lookups do not fail (i.e. all model classes
        // should be defined and available before this method is used).

        const _tableNameForEntityName = (name) => {
            return this.tableNameForEntityName(name);
        };
        const _joinTableFieldNameForEntityName = (name) => {
            return this.joinTableFieldNameForEntityName(name);
        };

        const relationMappings = {};
        relations.forEach(e => {

            const mapping = {};
            const destTableName = this.tableNameForEntityName(e.type);

            if(e.array === true) {

                if(e.joinToField) {

                    mapping.relation = BaseModel.HasManyRelation;
                    mapping.modelClass = lookupModel(e.type);
                    mapping.join = {
                        from: `${tableName}.id`,
                        to: `${destTableName}.${e.joinToField}`
                    };

                } else {

                    const joinTableName = `${tableName}-${_tableNameForEntityName(e.field)}`;

                    mapping.relation = BaseModel.ManyToManyRelation;
                    mapping.modelClass = lookupModel(e.type);
                    mapping.join = {
                        from: `${tableName}.id`,
                        through: {
                            from: `${joinTableName}.${_joinTableFieldNameForEntityName(name)}`,
                            to: `${joinTableName}.${_joinTableFieldNameForEntityName(e.type)}`
                        },
                        to: `${destTableName}.id`
                    };

                    // Files support additional fields on the relations (order, as well as labels and types).
                    if(e.type === "File") {

                        mapping.join.through.extra = ['order', 'removed'];

                        if(e.fileLabels === true) {
                            mapping.join.through.extra.push('label');
                        }

                        if(e.fileTypes === true) {
                            mapping.join.through.extra.push('type');
                        }
                    }
                }

            } else {

                if(e.joinToField) {

                    mapping.relation = BaseModel.HasOneRelation;
                    mapping.modelClass = lookupModel(e.type);
                    mapping.join = {
                        from: `${tableName}.id`,
                        to: `${destTableName}.${e.joinToField}`
                    };

                } else {

                    if(!e.joinField) {
                        //logger.warn(`Dynamic model ${task.name} has field element ${e.field} specified as a relationship (singular) but no 'join-field' specified.`);
                        return;
                    }

                    mapping.relation = BaseModel.BelongsToOneRelation;
                    mapping.modelClass = lookupModel(e.type);
                    mapping.join = {
                        from: `${tableName}.${e.joinField}`,
                        to: `${destTableName}.id`
                    };
                }

            }

            relationMappings[e.field] = mapping;
        });

        this._cachedRelationMapping = relationMappings;
        return relationMappings;
    }



    static tableNameForEntityName(name) {
        return name.replace(/^(.)/g, (a) => a.toLowerCase()).replace(/([A-Z])/g, (a) => '-' + a.toLowerCase());
    }

    static joinTableFieldNameForEntityName(name) {
        return name.replace(/^(.)/g, (a) => a.toLowerCase()) + 'Id';
    }


    // GraphQL TypeDef generation
    // ---

    static get graphQLModelImplements() {
        return ['Object'];
    }

    static get graphQLModelBaseTypes() {
        return [
            `id: ID!`,
            `created: DateTime!`,
            `updated: DateTime`,
            `restrictedFields: [String!]`
        ];
    }

    static get graphQLModelInputBaseTypes() {
        return [
            `id: ID!`,
        ];
    }


    static graphQLTypeDefinition() {

        const implementationName = this.implementationName;
        const modelName = this.graphQLModelName;
        const model = this.modelDefinition;

        const listingFilterFields = model.listingFilterFields();
        const listingSortableFields = model.listingSortableFields();

        const typeStatements = [];
        const queryStatements = [];
        const subscriptionStatements = [];
        let addedStatements = null;

        const listingAccessorName = this.listingAccessorName;
        const listingOutputResultName = `${modelName}ListingResult`;
        const listingPageInfoName = `${modelName}ListingPageInfo`;
        const listingFilterInputTypeName = `${modelName}ListingFilterInput`;
        const listingSortingInputTypeName = `${modelName}ListingSortingInput`;

        queryStatements.push(`get${implementationName}(id:ID): ${modelName}`);

        if((listingFilterFields && listingFilterFields.length) || (listingSortableFields && listingSortableFields.length)) {

            const { parameters, additionalStatements } = this.graphQLListingFilterParameters(listingFilterFields, listingFilterInputTypeName, listingSortableFields, listingSortingInputTypeName);

            queryStatements.push(`${listingAccessorName}(${parameters.join(", ")}) : ${listingOutputResultName}`);

            typeStatements.push(_gqlListingOutputType(modelName, listingOutputResultName, listingPageInfoName));
            typeStatements.push(_gqlListingPageInfo(listingPageInfoName));

            if(additionalStatements && additionalStatements.length) {
                addedStatements = additionalStatements;
            }

        } else {

            queryStatements.push(`${listingAccessorName} : [${modelName}]`);
        }


        subscriptionStatements.push(`created${implementationName} : ID!`);
        subscriptionStatements.push(`modified${implementationName} : ID!`);

        return (
            (this.graphQLModelDefinition() + '\n\n') +
            (queryStatements.length ?  `extend type Query {\n${_Tab}${queryStatements.join('\n' + _Tab)}\n}` + '\n\n' : "") +
            (subscriptionStatements.length ?  `extend type Subscription {\n${_Tab}${subscriptionStatements.join('\n' + _Tab)}\n}` + '\n\n' : "") +
            (typeStatements.length ? typeStatements.join('\n') + '\n\n' : "")
            ((addedStatements && addedStatements.length) ? addedStatements.join('\n') + '\n\n' : "")
        );
    }


    static graphQLModelDefinition() {

        const model = this.modelDefinition;
        const modelName = this.graphQLModelName;
        const modelImplements = this.graphQLModelImplements;

        const typeListings = [
            ...(this.graphQLModelBaseTypes || []),
            ...GraphQLHelper.gqlTypeListingForFields(model.fields, this.workflowDescription, GraphQLHelper.TypeListingRestriction.All)
        ];

        return `type ${modelName} ${(modelImplements && modelImplements.length) ? "implements " + modelImplements.join(' & ') + " " : ""}{\n${typeListings.map(v => '\t' + v).join("\n")}\n}` + '\n\n';
    }

    static graphQLListingFilterParameters(listingFilterFields, listingFilterInputTypeName, listingSortableFields, listingSortingInputTypeName) {

        const f = [];
        f.push(`first:Int`);
        f.push(`offset:Int`);

        if(listingFilterFields && listingFilterFields.length) {
            f.push(`filter:${listingFilterInputTypeName}`);
        }
        if(listingSortableFields && listingSortableFields.length) {
            f.push(`sorting:${listingSortingInputTypeName}`);
        }

        /*const extensions = this.modelExtensions;
        const additionalStatements = [];

        if(extensions && extensions.length) {
            extensions.forEach(ext => {
                if(ext.modifyListingParameters) {
                    const statement = ext.modifyListingParameters(f, taskDef, enums);
                    if(statement && statement.length) {
                        additionalStatements.push(statement);
                    }
                }
            });
        }*/

        return {
            parameters: f,
            additionalStatements: []
        };
    }
}



function _gqlListingOutputType(modelName, resultName, pageInfoName) {

    return `type ${resultName} {
    results: [${modelName}]
    pageInfo: ${pageInfoName}
}`;
}

function _gqlListingPageInfo(pageInfoName) {

    return `type ${pageInfoName} {
    totalCount: Int
    offset: Int
    pageSize: Int
}`;
}


module.exports = WorkflowModel;