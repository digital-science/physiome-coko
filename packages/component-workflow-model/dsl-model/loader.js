const WorkflowDescription = require('client-workflow-model/WorkflowDescription');
const WorkflowInstance = require('./workflow-instance');
const { registerModel } = require('./model-registry');
const { registerInstance } = require('./instance-registry');
const GraphQLJSON = require('graphql-type-json');
const loadSharedModel = require('./../shared-model/index');

const GraphQLHelper = require('./graphql-helper');
const _Tab = GraphQLHelper.Tab;

const fs = require('fs');
const path = require('path');



function loadWorkflowDescription(desc) {

    const workflowDescription = new WorkflowDescription(desc);
    const shared = loadSharedModel();
    const definedModelTypes = [];


    // Resolve any extensions that are specified.
    const extensions = [];

    if(desc.extensions) {
        desc.extensions.forEach(ext => {
            try {
                const mod = require(ext);
                if(mod) {

                    if(mod.modelExtensions) {
                        extensions.push(mod.modelExtensions);
                    } else {
                        logger.warn(`workflow model extension [${ext}] does not export 'modelExtensions'.`);
                    }
                }

            } catch(e) {
                logger.error(`unable to load workflow model extension [${ext}] due to: ${e.toString()}`);
            }
        });
    }


    // Register any shared model objects.
    if(shared.models) {
        Object.keys(shared.models).forEach(modelName => {
            registerModel(modelName, shared.models[modelName]);
        });
    }


    // For each defined instance type
    if(workflowDescription.instanceTypes) {

        Object.keys(workflowDescription.instanceTypes).forEach(key => {

            const instanceDefinition = workflowDescription.instanceTypes[key];
            const modelClass = _defineInstance(workflowDescription, instanceDefinition, extensions);

            registerModel(modelClass.implementationName, modelClass);
            registerInstance(modelClass.implementationName, modelClass);

            definedModelTypes.push(modelClass);
        });
    }


    // For each defined model type, we want to generate the required GQL statements and append those.
    const baseTypeDefs = fs.readFileSync(path.resolve(__dirname, './dsl-base.graphqls'), 'utf8');
    const modelTypeDefs = definedModelTypes.map(model => model.graphQLTypeDefinition()).join('\n\n');
    const instanceUnion = 'union WorkflowInstance = ' + definedModelTypes.map(model => model.graphQLModelName).join(" | ");

    const gqlTypeDef = baseTypeDefs + '\n\n' + (shared.typeDefs || '') + '\n\n' + _enumsToTypeDefinition(workflowDescription.enums)
        + '\n\n' + modelTypeDefs + (definedModelTypes.length ? '\n\n' + instanceUnion : "");


    // For each of the defined model types, generate the GQL resolver set and merge these into the aggregate resolver set.
    const gqlResolvers = {
        JSON: GraphQLJSON
    };

    _mergeResolvers(gqlResolvers, _enumsToResolvers(workflowDescription.enums));

    definedModelTypes.forEach(model => {
        const resolvers = model.graphQLResolvers();
        if(resolvers) {
            _mergeResolvers(gqlResolvers, resolvers)
        }
    });


    // Include any shared model resolvers into the final resolver set.
    if(shared.resolvers && shared.resolvers.length) {
        shared.resolvers.forEach(resolver => {
            _mergeResolvers(gqlResolvers, resolver);
        });
    }


    const setupServer = (app) => {
        if(!shared.serverSetups || !shared.serverSetups.length) {
            return Promise.resolve();
        }

        const promises = shared.serverSetups.map(r => r(app));
        return Promise.all(promises);
    };

    return {
        gqlTypeDef,
        gqlResolvers,
        setupServer
    };
}


function _defineInstance(workflowDescription, instanceDefinition, extensions) {

    const matchingExtensions = (extensions || []).filter(ext => ext.hasOwnProperty(instanceDefinition.name)).map(ext => ext[instanceDefinition.name]);

    const createClass = (name, cls) => ({
        [name] : class extends cls {

            static get workflowDescription() {
                return workflowDescription;
            }

            static get modelDefinition() {
                return instanceDefinition.model;
            }

            static get implementationName() {
                return instanceDefinition.name;
            }

            static get graphQLModelName() {
                return this.modelDefinition.name || instanceDefinition.name;
            }

            static get listingAccessorName() {
                return instanceDefinition.listingAccessor;
            }

            static get aclSet() {
                return instanceDefinition.acl;
            }

            static get modelExtensions() {
                return matchingExtensions.length ? matchingExtensions : null;
            }

            static get instanceDefinition() {
                return instanceDefinition;
            }
        }
    })[name];

    const instanceName = instanceDefinition.name;
    return createClass(instanceName, WorkflowInstance);
}

function _mergeResolvers(target, source) {

    if(!source) {
        return target;
    }

    Object.keys(source).forEach(key => {
        const dest = target[key] || {};
        Object.assign(dest, source[key]);
        target[key] = dest;
    });

    return target;
}


function _enumsToTypeDefinition(enums) {

    if(!enums) {
        return null;
    }

    const enumTypeDefs = Object.values(enums).map(enumDef => {

        return `enum ${enumDef.name} {
${Object.keys(enumDef.values).map(v => _Tab + v).join("\n")}
}`;
    });

    return enumTypeDefs.join('\n\n');
}


function _enumsToResolvers(enums) {

    const resolvers = {};

    if(enums) {
        Object.values(enums).forEach(enumDef => {
            resolvers[enumDef.name] = enumDef.values;
        });
    }

    return resolvers;
}


module.exports = loadWorkflowDescription;