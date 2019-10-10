const { BaseModel } = require('component-model');
const { pubsubManager } = require("pubsweet-server");
const GraphQLFields = require('graphql-fields');
const AclRule = require('client-workflow-model/AclRule');
const config = require('config');
const _ = require("lodash");

const { AuthorizationError, NotFoundError } = require('@pubsweet/errors');
const LoggerWithPrefix = require('workflow-utils/logger-with-prefix');

const GraphQLHelper = require('./graphql-helper');
const { lookupModel } = require('./model-registry');
const { Identity } = require('../shared-model/identity');

const _AllowedAdditionalReadFields = ['id', 'created', 'updated', 'tasks', 'restrictedFields'];
const _Tab = GraphQLHelper.Tab;
const AclActions = AclRule.Actions;


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

    static get allowsSubscriptions() {
        return false;
    }


    // Misc helpers

    static get allowedReadFields() {

        if(this._cachedAllowedReadFields) {
            return this._cachedAllowedReadFields;
        }

        const allowedFields = {};

        this.modelDefinition.fields.forEach(e => {
            if(e.field) {
                allowedFields[e.field] = e;
            }
        });

        return (this._cachedAllowedReadFields = allowedFields);
    }

    static get specificModelExtensions() {

        if(this._cachedSpecificModelExtensions) {
            return this._cachedSpecificModelExtensions;
        }

        const extensions = this.modelExtensions;

        return this._cachedSpecificModelExtensions = extensions ? {
            modifyListingQuery: extensions.map(ext => ext.modifyListingQuery).filter(f => !!f),
            modifyListingFilterQuery: extensions.map(ext => ext.modifyListingFilterQuery).filter(f => !!f),
            modifyListingFilterQueryForField: extensions.map(ext => ext.modifyListingFilterQueryForField).filter(f => !!f)
        } : {};
    }

    get allowedAdditionalReadFields() {
        return _AllowedAdditionalReadFields;
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
            return ModelClass.listingQueryEndpoint(ctxt, input, context, info).catch(err => {
                console.error(err.toString());
                console.error(err.stack);
                throw err;
            });
        };


        // Field Resolvers
        // ---
        const fieldResolvers = {};
        const relationFields = model.relationFields(workflowDef);

        if(relationFields && relationFields.length) {

            relationFields.forEach(field => {
                fieldResolvers[field.field] = async (ctxt, input, context, info) => {
                    // FIXME: relation resolutions will need to have ACL applied to it as well
                    return ModelClass.relationResolverImplementation(ctxt, input, context, info, field);
                };
            });
        }

        // Subscriptions
        // ---
        const subscription = {};

        if(this.allowsSubscriptions) {
            subscription[`created${implementationName}`] = {
                subscribe: async (_, vars, context) => ModelClass.asyncIteratorModelWasCreated()
            };
            subscription[`modified${implementationName}`] = {
                subscribe: async (_, vars, context) => ModelClass.asyncIteratorModelWasModified()
            };
        }


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

        this.logger.debug(`get (id: ${input.id})`);

        const fieldsWithoutTypeName = GraphQLFields(info, {}, { excludedFields: ['__typename'] });
        const topLevelFields = fieldsWithoutTypeName ? Object.keys(fieldsWithoutTypeName) : [];
        let eagerResolves = null;

        if(this.relationFieldNames && this.relationFieldNames.length && fieldsWithoutTypeName) {
            eagerResolves = this._getEagerFieldsForQuery(topLevelFields);
        }

        const [object, user] = await Promise.all([
            this.find(input.id, eagerResolves),
            this.resolveUserForContext(context)
        ]);

        if(!object) {
            return new NotFoundError("Instance not found.");
        }

        const [aclTargets, isOwner] = this.userToAclTargets(user, object);

        if(this.aclSet) {

            const accessMatch = this.aclSet.applyRules(aclTargets, AclActions.Access, object);
            this._debugAclMatching(user, aclTargets, isOwner, AclActions.Access, accessMatch);
            if(!accessMatch.allow) {
                throw new AuthorizationError("You do not have access to this object.");
            }

            if(!this.restrictionsApplyToUser(accessMatch.allowedRestrictions, isOwner)) {
                throw new AuthorizationError("You do not have access to this object.");
            }
        }

        this.addModelInstanceToGraphQLContext(context, object, this);

        return object.copyAllowedFieldsAsObject(aclTargets, topLevelFields);
    }

    static async listingQueryEndpoint(ctxt, input, context, info) {

        const fieldsWithoutTypeName = GraphQLFields(info, {}, { excludedFields: ['__typename'] });
        const topLevelFields = (fieldsWithoutTypeName && fieldsWithoutTypeName.results) ? Object.keys(fieldsWithoutTypeName.results) : [];
        const limit = input.first || 200;
        const offset = input.offset || 0;

        let eagerResolves = null;
        if(this.relationFieldNames && this.relationFieldNames.length && fieldsWithoutTypeName) {
            eagerResolves = this._getEagerFieldsForQuery(topLevelFields);
        }

        this.logger.debug(`list (fields=${topLevelFields.length}, eager=[${eagerResolves ? eagerResolves.join(",") : ""}])`);

        const user = await this.resolveUserForContext(context);
        let allowedRestrictions;


        // For the current user, determine what level of access they are allowed on objects.
        // This will normally be either "all" for an admin user or "owner" if they are the submitter etc.

        if(this.aclSet) {

            const [aclTargets, _] = this.userToAclTargets(user, null);

            const accessMatch = this.aclSet.applyRules(aclTargets, AclActions.Access);
            this._debugAclMatching(user, aclTargets, null, AclActions.Access, accessMatch);
            if(!accessMatch.allow) {
                throw new AuthorizationError("You do not have access to this object.");
            }

            allowedRestrictions = accessMatch.allowedRestrictions;

        } else {

            allowedRestrictions = ["all"];
        }


        // We need to modify the select query. First, restrict the select to only top level fields the user is interested in.
        // Second, we need to obtain the full count of results over the entire data set (not just the limited range).

        const filter = input.filter;
        const knex = this.knex();
        let addedWhereStatement = false;
        let query = this.query();

        const relationFieldNames = {};
        if(this.relationFieldNames) {
            this.relationFieldNames.forEach(f => relationFieldNames[f] = true);
        }

        const topLevelFieldsWithoutRelations = topLevelFields.filter(field => !relationFieldNames.hasOwnProperty(field));
        const belongsToOneFields = this.belongsToOneRelationFields.filter(m => topLevelFields.indexOf(m.field.field) !== -1);

        // Note: any belongs-to-one field requires the underlying ID field to be resolved as well,
        // this is required for loading via a relation resolver via the stored instance within the context.

        query = query.select([...topLevelFieldsWithoutRelations, ...belongsToOneFields.map(m => m.join)])
            .select(knex.raw('count(*) OVER() AS internal_full_count'))
            .limit(limit)
            .offset(offset);


        const listingFilterFields = this.modelDefinition.listingFilterFields();

        if(listingFilterFields && listingFilterFields.length && filter && Object.keys(filter).length) {

            const filterExtensions = this.specificModelExtensions.modifyListingFilterQuery;
            const filterFieldExtensions = this.specificModelExtensions.modifyListingFilterQueryForField;

            query = query.where(b => {

                let builder = b;

                listingFilterFields.forEach(f => {

                    if(filter[f.field] === undefined) {
                        return;
                    }

                    const v = filter[f.field];

                    // If there are any extensions that seek to modify the "where" statement produced for a specific field
                    // we can let them override it here. Extensions are performed on a first-in basis. Once one extension
                    // overrides the field and modifies the query, all other processing for the field is terminated.

                    if(filterFieldExtensions && filterFieldExtensions.length) {
                        for(let i = 0; i < filterFieldExtensions.length; i++) {
                            const r = filterFieldExtensions[i](builder, f, v, this.modelClass, filter);
                            if(r) {
                                builder = r;
                                addedWhereStatement = true;
                                return;
                            }
                        }
                    }

                    if (v !== null) {

                        if (f.listingFilterMultiple) {

                            if (v instanceof Array) {
                                builder = builder.whereIn(f.field, v);
                                addedWhereStatement = true;
                            }

                        } else {

                            if(v === false) {
                                builder = builder.where(bb => bb.where(f.field, false).orWhereNull(f.field));
                            } else {
                                builder = builder.where(f.field, v);
                            }
                            addedWhereStatement = true;

                        }

                    } else {

                        builder = builder.whereNull(f.field);
                        addedWhereStatement = true;
                    }
                });

                // Apply any filtering extensions (these are not field specific). All extensions which provide a
                // 'modifyListingFilterQuery' will have the extension applied, regardless whether or not another
                // extension has already performed a modification to the query.

                if(filterExtensions && filterExtensions.length) {
                    for(let i = 0; i < filterExtensions.length; i++) {
                        const r = filterExtensions[i](builder, this.modelClass, filter);
                        if(r) {
                            builder = r;
                            addedWhereStatement = true;
                        }
                    }
                }
            });
        }


        // ACL matching then needs to apply on a per object basis to determine what the user is allowed to see.
        // Because conditions can be applied, this can change what users can access on a per object basis.
        // An easy top level restriction to apply in the first instance however is to check to see if the user
        // isn't allowed access to all instances, if that is the case a where statement is constructed to restrict
        // to fields where the user is considered an "owner".

        // FIXME: we will need to include any variables within the ACL conditions inside the requested fields set
        // we may even need to figure out if it is possible to include conditions inside the where clauses that
        // represent the restrictions in place for the current user

        if(allowedRestrictions.indexOf("all") === -1) {

            if(!user) {
                throw new AuthorizationError("You must be a valid user ");
            }

            const ownerFields = this.modelDefinition.ownerFields();
            if(ownerFields && ownerFields.length) {

                const ownerFieldStatementBuilder = builder => {

                    let b = builder;

                    ownerFields.forEach((f, index) => {
                        if(index === 0) {
                            b = b.where(f.joinField, user.id);
                        } else {
                            b = b.orWhere(f.joinField, user.id);
                        }
                    });
                };

                query = addedWhereStatement ? query.andWhere(ownerFieldStatementBuilder) : query.where(ownerFieldStatementBuilder);
            }
        }

        query = query.skipUndefined();


        // Apply any sorting
        const listingSortableFields = this.modelDefinition.listingSortableFields();
        const sorting = input.sorting;

        if(listingSortableFields && listingSortableFields.length && sorting && Object.keys(sorting).length) {

            const ordering = [];

            listingSortableFields.forEach(f => {

                if(sorting[f.field] === undefined) {
                    return;
                }

                const v = sorting[f.field];
                if(typeof(v) !== "boolean") {
                    return;
                }

                if(v) {
                    ordering.push({ column: f.field, order: 'desc' });
                } else {
                    ordering.push({ column: f.field });
                }
            });

            if(ordering.length) {
                query = query.orderBy(ordering);
            }
        }


        // Apply any extensions that wish to modify the listing query
        if(this.specificModelExtensions.modifyListingQuery) {
            this.specificModelExtensions.modifyListingQuery.forEach(ext => {

                const newQuery = ext(query, this.modelClass, input, topLevelFields, eagerResolves);
                if(newQuery) {
                    query = newQuery;
                }
            });
        }


        // Eager resolve on any fields inside this request, we also restrict the fields returned down to those requested by the user.
        // If the eager resolve includes fields which happen to be another relation, then we automatically do a more expensive eager
        // resolve onto that field as well (but we don't restrict the fields returned from that request).

        if(eagerResolves) {

            const eagerResolveFields = this.relationFields.filter(f => eagerResolves.indexOf(f.field) !== -1);

            const eagerParts = eagerResolveFields.map(eagerField => {

                const eagerFields = Object.keys(fieldsWithoutTypeName.results[eagerField.field]);
                if(!eagerFields.length) {
                    return null;
                }

                const eagerPart = {
                    field: eagerField,
                    relation: [],
                    basic: []
                };

                const model = eagerField.model || lookupModel(eagerField.type);

                // FIXME: if the model has "owner" fields, then we need to resolve those as well (maybe allow a model to return a set fields needed for ACL resolution) ??

                // If the model has relations, then we can attempt to go down one level
                if(model && model.relationFieldNames && model.relationFieldNames.length) {

                    const modelRelationFieldNames = model.relationFieldNames;

                    eagerFields.forEach(f => {
                        if(modelRelationFieldNames.indexOf(f) !== -1) {
                            eagerPart.relation.push(f);
                        } else {
                            eagerPart.basic.push(f);
                        }
                    });

                } else {

                    eagerPart.basic = eagerFields;
                }

                return eagerPart;

            }).filter(p => !!p);

            query = query.eager('[' + eagerParts.map(part => {

                if(part.relation.length) {
                    return (part.relation.length === 1) ? `${part.field.field}.${part.relation[0]}` : `${part.field.field}.[${part.relation.join(', ')}]`;
                }

                return part.field.field;

            }).join(', ') + ']');


            eagerParts.forEach(part => {
                if(part.basic && part.basic.length) {
                    query = query.modifyEager(part.field.field, builder => builder.select(part.basic));
                }
            });
        }

        this.logger.debug(`listing query: ${query.toSql()}`);

        const r = await query;
        this.addModelInstanceToGraphQLContext(context, r, this);

        // For each result, we then apply read ACL rules to it, ensuring only the allowed fields are returned for each instance.
        const totalCount = (r && r.length ? r[0].internalFullCount : 0);

        const results = r.map(object => {
            const [aclTargets, _] = this.userToAclTargets(user, object);
            return object.copyAllowedFieldsAsObject(aclTargets, topLevelFields);
        });

        return {
            results,
            pageInfo: {
                totalCount,
                offset,
                pageSize: limit
            }
        };
    }


    static async relationResolverImplementation(ctxt, input, context, info, field) {

        const fieldsWithoutTypeName = GraphQLFields(info, {}, { excludedFields: ['__typename'] });
        const topLevelFields = Object.keys(fieldsWithoutTypeName);

        const parentInstance = this.lookupModelInstanceInGraphQLContext(context, ctxt.id, this);
        if(!parentInstance) {
            this.logger.warn(`relationResolverImplementation, unable to find parent instance in GraphQL context (id = ${ctxt.id})`);
            return null;
        }

        const targetModel = field.model || lookupModel(field.type);
        if(!targetModel) {
            this.logger.warn(`relationResolverImplementation, field model wasn't resolved (id = ${ctxt.id}, field.type = ${field.type})`);
            return null;
        }

        let relation = null;

        if(!ctxt.hasOwnProperty(field.field) || ctxt[field.field] === undefined) {

            let query = parentInstance.$relatedQuery(field.field);
            const targetRelationFieldNames = targetModel.relationFieldNames || [];
            const requestedRelationFields = targetRelationFieldNames.filter(f => fieldsWithoutTypeName.hasOwnProperty(f));
            const belongsToOneFields = (targetModel.belongsToOneRelationFields || []).filter(m => topLevelFields.indexOf(m.field.field) !== -1);


            if(requestedRelationFields && requestedRelationFields.length) {

                const basicFields = topLevelFields.filter(f => requestedRelationFields.indexOf(f) === -1);

                query = query.select([...basicFields, ...belongsToOneFields]).eager('[' + requestedRelationFields.join(', ') + ']');

            } else {

                query = query.select([...topLevelFields, ...belongsToOneFields]);
            }

            relation = await query;

        } else {

            relation = ctxt[field.field];
        }

        if(!relation) {
            return null;
        }

        this.addModelInstanceToGraphQLContext(context, relation, targetModel);

        // FIXME: need to implement proper object security model at this point !!!

        if(typeof relation.copyAllowedFieldsAsObject === 'function') {

            //if(relation.copyAllowedFieldsAsObject(aclTargets, topLevelFields))

        } else {

            // parentInstance security model is applied here !!!
        }

        // we now need to extract the allowed fields etc from this model instance...

        return relation;
    }


    static _getEagerFieldsForQuery(topLevelFields) {

        const fields = this.relationFields.filter(f => topLevelFields.indexOf(f.field) !== -1);

        return fields.map(f => {
            const defaultEager = f.model.defaultEager || "";
            return (defaultEager && defaultEager.length) ? `${f.field}.${defaultEager}` : f.field;
        });
    }


    // Resolver Helpers
    // ---

    copyAllowedFieldsAsObject(aclTargets, topLevelFields) {

        // Given a set of Acl targets and a set of top level fields (from a GQL query), create an object
        // containing all of the allowed fields after applying the models acl rule sets.

        const aclSet = this.constructor.aclSet;
        let aclMatch = null;

        if(aclSet) {
            aclMatch = aclSet.applyRules(aclTargets, AclActions.Read, this, 'server');
            if(!aclMatch.allow) {
                return {
                    id:this.id,
                    restrictedFields: topLevelFields.filter(f => f !== 'id')
                };
            }
        }

        const allowedFields = this.allowedReadFieldsForReadAcl(aclMatch, true);

        const filteredRequestedAllowedFields = topLevelFields.filter(f => allowedFields.hasOwnProperty(f));
        const r = {id:this.id};

        filteredRequestedAllowedFields.forEach(f => {
            if(this[f] !== undefined) {
                r[f] = this[f];
            }
        });

        r.restrictedFields = topLevelFields.filter(f => !allowedFields.hasOwnProperty(f));
        if(!r.restrictedFields.length) {
            delete r.restrictedFields;
        }

        return r;
    };

    allowedReadFieldsForReadAcl(readAcl, includeAdditionalFields=true) {

        const allowedFields = (readAcl && readAcl.allowedFields) ? _.pick(this.constructor.allowedReadFields, readAcl.allowedFields) : Object.assign({}, this.constructor.allowedReadFields);

        if(includeAdditionalFields && this.allowedAdditionalReadFields) {
            this.allowedAdditionalReadFields.forEach(f => allowedFields[f] = true);
        }

        return allowedFields;
    };


    static addModelInstanceToGraphQLContext(context, instance, modelClass = null) {

        modelClass = modelClass || this;

        if(!context.modelLookup) {
            context.modelLookup = new Map();
        }

        if(!context.modelLookup.has()) {
            context.modelLookup.set(modelClass, {});
        }

        const lookup = context.modelLookup.get(modelClass);

        if(instance instanceof Array) {
            if(instance.length) {
                instance.forEach(inst => lookup[inst.id] = inst);
            }
        } else {
            lookup[instance.id] = instance;
        }
    }

    static lookupModelInstanceInGraphQLContext(context, instanceId, modelClass = null) {

        if(!context.modelLookup) {
            return null;
        }

        const lookup = context.modelLookup.get(modelClass);
        if(!lookup) {
            return null;
        }

        return lookup[instanceId] || null;
    }



    static async resolveUserForContext(context) {

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

    static userToAclTargets(user, object) {

        // By default, everyone gets the "anonymous" role applied.

        const targets = ["anonymous"];
        let isOwner = false;

        if(user && user.id) {

            targets.push("user");

            const groups = user.finalisedAccessGroups;
            if(groups && groups.length) {
                targets.push.apply(targets, groups);
            }
        }

        if(user && user.id && object) {

            this.modelDefinition.ownerFields().forEach(field => {
                const ownerId = object[field.joinField];
                if(ownerId === user.id) {
                    isOwner = true;
                }
            });

            if(isOwner) {
                targets.push("owner");
            }
        }

        return [targets, isOwner];
    }

    static restrictionsApplyToUser(restrictions, isOwner) {

        if(!restrictions || !restrictions.length) {
            return true;
        }

        if(restrictions.indexOf("all") !== -1) {
            return true;
        }

        return (isOwner && restrictions.indexOf("own") !== -1);
    }



    // PubSub related
    // ---

    static async publishWasCreated(model) {

        const pubSub = await pubsubManager.getPubsub();
        if(pubSub) {
            const r = {};
            r[`created${this.implementationName}`] = model.id;
            pubSub.publish(`${this.implementationName}.created`, r);
        }
    }

    async publishWasCreated() {
        return this.constructor.publishWasCreated(this);
    }

    static async publishWasModified(model) {

        const pubSub = await pubsubManager.getPubsub();
        if(pubSub) {
            const r = {};
            r[`modified${this.implementationName}`] = model.id;
            pubSub.publish(`${this.implementationName}.updated`, r);
        }
    }

    async publishWasModified() {
        return this.constructor.publishWasModified(this);
    }


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

    static get jsonSchema() {
        return this.schema;
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

        const properties = {
            id: { type: 'string', format: 'uuid' },
            created: { type: ['string', 'object'], format: 'date-time' },
            updated: { type: ['string', 'object'], format: 'date-time' }
        };

        props.forEach(p => {
            properties[p.key] = p.value;
        });

        this._cachedSchema = {
            type:'object',
            properties,
            additionalProperties: false
        };
        return this._cachedSchema;
    }

    static get relationMappings() {

        if(this._cachedRelationMapping) {
            return this._cachedRelationMapping;
        }

        const name = this.implementationName;
        const relations = this.relationFields;
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

    static get belongsToOneRelationFields() {

        const relations = this.relationFields;
        if(!relations) {
            return [];
        }

        return relations.filter(field => field.array !== true && !field.joinToField && field.joinField).map(field => {
            return {field, join:field.joinField};
        });
    }



    static tableNameForEntityName(name) {
        return name.replace(/^(.)/g, (a) => a.toLowerCase()).replace(/([A-Z])/g, (a) => '-' + a.toLowerCase());
    }

    static joinTableFieldNameForEntityName(name) {
        return name.replace(/^(.)/g, (a) => a.toLowerCase()) + 'Id';
    }


    static get relationFields() {

        if(this._cachedRelationFields) {
            return this._cachedRelationFields;
        }

        const model = this.modelDefinition;
        const relationFields = model.relationFields(this.workflowDescription);

        if(relationFields) {
            relationFields.forEach(field => {
                field.model = lookupModel(field.type);
            });
        }

        return this._cachedRelationFields = relationFields;
    }

    static get relationFieldNames() {

        if(this._cachedRelationFieldNames) {
            return this._cachedRelationFieldNames;
        }
        return this._cachedRelationFieldNames = (this.relationFields || []).map(f => f.field);
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

            if(listingFilterFields && listingFilterFields.length) {
                typeStatements.push(_gqlListingFilterInput(listingFilterInputTypeName, this.workflowDescription, listingFilterFields));
            }
            if(listingSortableFields && listingSortableFields.length) {
                typeStatements.push(_gqlListingSortingInput(listingSortingInputTypeName, this.workflowDescription, listingSortableFields));
            }

            typeStatements.push(_gqlListingOutputType(modelName, listingOutputResultName, listingPageInfoName));
            typeStatements.push(_gqlListingPageInfo(listingPageInfoName));

            if(additionalStatements && additionalStatements.length) {
                addedStatements = additionalStatements;
            }

        } else {

            queryStatements.push(`${listingAccessorName} : [${modelName}]`);
        }

        if(this.allowsSubscriptions) {
            subscriptionStatements.push(`created${implementationName} : ID!`);
            subscriptionStatements.push(`modified${implementationName} : ID!`);
        }

        return (
            (this.graphQLModelDefinition() + '\n\n') +
            (queryStatements.length ?  `extend type Query {\n${_Tab}${queryStatements.join('\n' + _Tab)}\n}` + '\n\n' : "") +
            (subscriptionStatements.length ?  `extend type Subscription {\n${_Tab}${subscriptionStatements.join('\n' + _Tab)}\n}` + '\n\n' : "") +
            (typeStatements.length ? typeStatements.join('\n\n') + '\n\n' : "") +
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

        return `type ${modelName} ${(modelImplements && modelImplements.length) ? "implements " + modelImplements.join(' & ') + " " : ""}{\n${typeListings.map(v => _Tab + v).join("\n")}\n}` + '\n\n';
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


    // Logging assistance
    // ---

    static get logger() {
        if(this._logger) {
            return this._logger;
        }
        return (this._logger = LoggerWithPrefix(`Model/${this.implementationName}`));
    }

    get logger() {
        return this.constructor.logger;
    }

    static get _debugAclRules() {
        return config.get("logging.debugAclRules") === true;
    }

    static _debugAclMatching(user, userTargets, isOwner, action, match) {

        if(!this._debugAclRules) {
            return;
        }

        let msg = `acl-match: action:(${action}) user(${user ? user.id : "anon"}) acl-targets:(${userTargets.join(", ")}) is-owner:(${isOwner ? "true" : "false"})`;
        if(match) {

            if(match.matchingRules) {
                match.matchingRules.forEach(rule => msg += `\n    + ${rule.description}`);
            } else {
                msg += `\n    no matching rules found`;
            }

            if(match.allowedRestrictions && match.allowedRestrictions.length) {
                msg += `\n    allowed restriction: ${match.allowedRestrictions.join(', ')}`;
            }

            msg += `\n    outcome: ${match.allow ? "allow" : "disallow"}`;
        }

        this.logger.debug(msg);
    }
}



function _gqlListingFilterInput(inputName, workflowDescription, fields) {

    const typeListing = GraphQLHelper.gqlTypeListingForFields(fields, workflowDescription, GraphQLHelper.TypeListingRestriction.Listing);

    return `input ${inputName} {
${typeListing.map(v => _Tab + v).join('\n')}
}`;
}

function _gqlListingSortingInput(inputName, workflowDescription, fields) {

    const typeListing = GraphQLHelper.gqlTypeListingForFields(fields, workflowDescription, GraphQLHelper.TypeListingRestriction.All);

    return `input ${inputName} {
${typeListing.map(v => _Tab + v).join('\n')}
}`;
}


function _gqlListingOutputType(modelName, resultName, pageInfoName) {

    return `type ${resultName} {
${_Tab}results: [${modelName}]
${_Tab}pageInfo: ${pageInfoName}
}`;
}

function _gqlListingPageInfo(pageInfoName) {

    return `type ${pageInfoName} {
${_Tab}totalCount: Int
${_Tab}offset: Int
${_Tab}pageSize: Int
}`;
}


module.exports = WorkflowModel;