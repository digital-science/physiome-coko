/* For each task we need to create a new "Model" class instance. In addition to this, we also create the base set
 * of GraphQL endpoint resolvers. */

const { BaseModel } = require('component-model');
const { mergeResolvers, filterModelElementsForRelations, listingAccessorNameForTaskDefinition } = require('./utils');
const GraphQLFields = require('graphql-fields');
const logger = require('@pubsweet/logger');
const _ = require("lodash");

const { InstanceResolver } = require('./instance-resolver');
const AclSet = require('./acl-set');



/**/
/* Generate Models & Resolvers for each of the top level defined tasks, enums and top level model objects. */
/**/
exports.generateModelsAndResolvers = function generateModelsAndResolvers(tasks, enums, topLevelModels, extensions) {

    const models = {};
    const resolvers = {};
    const allModels = {};

    const lookupModel = (modelName) => {
        return allModels[modelName] || null;
    };

    tasks.forEach(task => {
        models[task.name] = createModelForTask(task, enums, lookupModel, extensions);
    });

    Object.assign(allModels, topLevelModels);
    Object.assign(allModels, models);

    tasks.forEach(task => {
        const r = createResolversForTask(task, enums, models, extensions);
        mergeResolvers(resolvers, r);
    });

    return {models:allModels, resolvers};
};


/**/
/* Common Resolvers shared between multiple models. */
/**/
exports.commonResolvers = {};


function _tableNameForEntityName(name) {

    return name.replace(/^(.)/g, (a) => a.toLowerCase()).replace(/([A-Z])/g, (a) => '-' + a.toLowerCase());
}

function _joinTableFieldNameForEntityName(name) {

    return name.replace(/^(.)/g, (a) => a.toLowerCase()) + 'Id';
}



function createModelForTask(task, enums, lookupModel, extensions) {

    const model = task.model;
    if(!model) {
        return;
    }

    const acl = task.acl ? new AclSet(task.acl, enums) : null;

    const relations = filterModelElementsForRelations(model.elements, enums);
    const relationNames = (relations || []).map(f => f.field);

    const props = model.elements.map(element => {

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

    const tableName = _tableNameForEntityName(task.name);
    const properties = {};
    props.forEach(p => {
        properties[p.key] = p.value;
    });

    const extensionsForTask = [];
    if(extensions && extensions.length) {
        extensions.forEach(ext => {
            if(ext && ext.hasOwnProperty(task.name)) {
                extensionsForTask.push(ext[task.name]);
            }
        });
    }


    const createClass = (name, cls) => ({
        [name] : class extends cls {

            static get tableName() {
                return tableName;
            }

            static get schema() {
                return {
                    type:'object',
                    properties
                };
            }


            static get urlName() {
                return tableName;
            }

            static get fileStorageKey() {
                return tableName;
            }

            static get acl() {
                return acl;
            }

            static get taskDefinition() {
                return task;
            }

            static get modelDescription() {
                return model;
            }

            static get extensions() {
                return extensionsForTask;
            }

            static get fileProperties() {
                return relations.filter(e => e.type === "File");
            }

            static get relationFieldDefinitions() {
                return relations;
            }

            static get relationFieldNames() {
                return relationNames;
            }

            static get instanceResolver() {
                return this._instanceResolver;
            }

            static set instanceResolver(v) {
                this._instanceResolver = v;
            }

            get instanceResolver() {
                return this.constructor.instanceResolver;
            }

            tasksForInstance() {
                return this.constructor.instanceResolver.tasksForInstance(this);
            }

            completeTaskForInstance(taskId, stateChanges) {
                return this.constructor.instanceResolver.completeTaskForInstance(this, taskId, stateChanges);
            }


            userToAclTargets(user) {
                const [aclTargets, _] = this.constructor.instanceResolver.userToAclTargets(user, this);
                return aclTargets;
            }

            publishInstanceWasCreated() {
                return this.id ? this.constructor.instanceResolver.publishInstanceWasCreated(this.id) : Promise.resolve();
            }

            publishInstanceWasModified() {
                return this.id ? this.constructor.instanceResolver.publishInstanceWasModified(this.id) : Promise.resolve();
            }


            static get relationMappings() {

                if(this._cachedRelationMapping) {
                    return this._cachedRelationMapping;
                }

                // Note: relation mapping generation is delayed to ensure that model lookups do not fail (i.e. all model classes
                // should be defined and available before this method is used).

                const relationMappings = {};
                relations.forEach(e => {

                    const mapping = {};
                    const destTableName = _tableNameForEntityName(e.type);

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
                                    from: `${joinTableName}.${_joinTableFieldNameForEntityName(task.name)}`,
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
                                logger.warn(`Dynamic model ${task.name} has field element ${e.field} specified as a relationship (singular) but no 'join-field' specified.`);
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
        }
    })[name];

    const newModelClass = createClass(task.name, BaseModel);
    newModelClass.instanceResolver = new InstanceResolver(newModelClass, task, enums, lookupModel);
    return newModelClass;
}



function createResolversForTask(task, enums, models, extensions) {

    const ModelClass = models[task.name];
    const relations = filterModelElementsForRelations(task.model.elements, enums);

    const allowCreate = !(task.model.noCreate === true);
    const mutation = {};

    if(allowCreate) {
        mutation[`create${task.name}`] = async function(ctxt, input, context, info) {
            return ModelClass.instanceResolver.create(context);
        };
    }

    mutation[`destroy${task.name}`] =  async function(ctxt, input, context, info) {
        return ModelClass.instanceResolver.destroy(input, context);
    };

    mutation[`update${task.name}`] = async function(ctxt, input, context, info) {
        return ModelClass.instanceResolver.update(input.input, info, context);
    };

    const query = {};
    query[`get${task.name}`] = async function(ctxt, input, context, info) {
        return ModelClass.instanceResolver.get(input, info, context);
    };

    const listingAccessorName = listingAccessorNameForTaskDefinition(task);
    query[listingAccessorName] = async function(ctxt, input, context, info) {
        return ModelClass.instanceResolver.list(input, info, context);
    };


    const fieldResolvers = {};
    fieldResolvers.tasks = async function tasksResolver(obj, input, context, info) {
        return ModelClass.instanceResolver.getTasks(obj.id, context);
    };


    relations.forEach(element => {
        fieldResolvers[element.field] = async (parent, args, context, info) => {
            // FIXME: relation resolutions will need to have ACL applied to it as well
            return ModelClass.instanceResolver.resolveRelation(element, parent, info, context);
        };
    });

    const accessorElements = relations ? relations.filter(e => e.accessors && e.accessors.length) : null;
    if(accessorElements && accessorElements.length) {

        accessorElements.filter(e => e.accessors.indexOf("set") !== -1).forEach(e => {

            let niceFieldName = e.field.charAt(0).toUpperCase() + e.field.slice(1);
            const mutationName = `set${task.name}${niceFieldName}`;

            mutation[mutationName] = async function(_, {id, linked}) {

                const object = await ModelClass.find(id);
                if(!object) {
                    return false;
                }

                await object.$relatedQuery(e.field).unrelate();

                if(linked && ((e.array === true && linked.length) || e.array === false)) {

                    if(e.type === "File") {

                        const linkedWithMetaDataFields = linked.map((l, index) => {
                            const r = {id:l.id, order:index, removed:false};

                            if(l.metaData && l.metaData.removed === true) {
                                r.removed = true;
                            }

                            if (e.fileLabels === true) {
                                if(l.metaData) {
                                    r.label = l.metaData.label || null;
                                } else {
                                    r.label = null;
                                }
                            }

                            if (e.fileTypes === true) {
                                if(l.metaData) {
                                    r.type = l.metaData.type || null;
                                } else {
                                    r.type = null;
                                }
                            }

                            return r;
                        });

                        await object.$relatedQuery(e.field).relate(linkedWithMetaDataFields);

                    } else {

                        await object.$relatedQuery(e.field).relate(linked);
                    }
                }

                return true;
            };
        });
    }

    const completeTaskMutationName = `completeTaskFor${task.name}`;
    mutation[completeTaskMutationName] = async function(_, args, context, info) {
        return ModelClass.instanceResolver.completeTask(args, context);
    };

    const subscription = {};
    subscription[`created${task.name}`] = {
        subscribe: async (_, vars, context) => ModelClass.instanceResolver.asyncIteratorWasCreated()
    };
    subscription[`modified${task.name}`] = {
        subscribe: async (_, vars, context) => ModelClass.instanceResolver.asyncIteratorWasModified()
    };

    const r = {
        Mutation: mutation,
        Query: query,
        Subscription: subscription
    };

    r[task.name] = fieldResolvers;
    return r;
}