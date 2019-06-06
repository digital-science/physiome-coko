const { server } = require('./src/workflow');
const resolvers = require('./src/resolvers');

const fs = require('fs');
const path = require('path');

module.exports = {
    server: () => server,
    resolvers,
    typeDefs: fs.readFileSync(
        path.join(__dirname, '/src/typeDefs.graphqls'),
        'utf8'
    )
};
