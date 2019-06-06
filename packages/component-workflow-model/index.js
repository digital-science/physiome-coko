const WorkflowModel = require('./model');

function serverSetup(app) {
    const File = require('./shared-model/file');
    File.serverSetup(app);
}

module.exports = {
    server: () => serverSetup,
    typeDefs: WorkflowModel.typeDefs,
    resolvers: WorkflowModel.resolvers
};