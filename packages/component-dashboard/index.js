const resolvers = require('./server/resolvers');
const fs = require('fs');

const typeDefs = fs.readFileSync(__dirname + '/server/defs.graphqls', 'utf8');

module.exports = {
    resolvers,
    typeDefs
};