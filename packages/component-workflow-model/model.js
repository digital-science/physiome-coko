const generateGraphQLDefs = require('./src/generate-graphql-definitions');


function configureModelsAndGraphQLDescriptions() {

    const workflowDesc = require('./../app/config/description');

    const r = generateGraphQLDefs(workflowDesc);
    const { models } = r;
    const urlMapping = {};

    Object.values(models).forEach(model => {
        if(model.urlName) {
            urlMapping[model.urlName] = model;
        }
    });

    r.urlMapping = urlMapping;
    return r;
}


module.exports = configureModelsAndGraphQLDescriptions();