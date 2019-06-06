const generateGraphQLDefs = require('./src/generate-graphql-definitions');


function configureModelsAndGraphQLDescriptions() {

    const workflowDesc = require('./../app/config/description');

    return generateGraphQLDefs(workflowDesc);
}


module.exports = configureModelsAndGraphQLDescriptions();