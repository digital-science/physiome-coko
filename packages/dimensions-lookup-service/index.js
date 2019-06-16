const path = require('path');
const fs = require("fs");

const DimensionsApi = require('./server/DimensionsApi');
const {apiBaseUrl, apiUserName, apiUserPassword} = require("config").get("dimensions");

const api = new DimensionsApi(apiBaseUrl, apiUserName, apiUserPassword);



const resolvers = require('./server/resolvers')(api);
const setup = require('./server/setup');

const typeDefs = fs.readFileSync(path.join(__dirname, '/server/lookup.graphqls'), 'utf8');


function serverSetup(app) {


    return setup(app);
}

module.exports = {
    server: () => serverSetup,
    typeDefs,
    resolvers
};