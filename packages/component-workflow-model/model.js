const loadWorkflowDescription = require('./dsl-model/loader');
const { models } = require('./dsl-model/model-registry');

function configureModelsAndGraphQLDescriptions() {

    const workflowDesc = require('./../app/config/description');
    const r = loadWorkflowDescription(workflowDesc);

    return {
        models,
        ...r
    };
}

module.exports = configureModelsAndGraphQLDescriptions();