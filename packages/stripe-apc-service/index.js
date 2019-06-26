const path = require('path');
const fs = require("fs");

const resolvers = require('./server/resolvers')();
const setup = require('./server/setup');

const typeDefs = fs.readFileSync(path.join(__dirname, '/server/service.graphqls'), 'utf8');

function serverSetup(app) {
    return setup(app);
}

module.exports = {
    server: () => serverSetup,
    typeDefs,
    resolvers
};