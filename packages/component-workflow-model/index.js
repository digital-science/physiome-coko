const WorkflowModel = require('./model');

/*
function serverSetup(app) {
    const File = require('./shared-model/file');
    File.serverSetup(app);
}
*/

module.exports = {
    server: () => function(app) {
        return WorkflowModel.setupServer(app);
    },
    typeDefs: WorkflowModel.gqlTypeDef,
    resolvers: WorkflowModel.gqlResolvers
};