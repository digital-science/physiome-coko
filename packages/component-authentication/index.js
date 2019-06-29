const authentication = require('@pubsweet/model-user/src/authentication');
const setupORCiDEndpoints = require('./server/orcid');
const path = require('path');
const fs = require('fs');

const resolvers = require('./server/resolvers');

module.exports = {
    resolvers,
    server: () => configurePassport,
    typeDefs: fs.readFileSync(
        path.join(__dirname, '/server/service.graphqls'),
        'utf8',
    ),
};

function configurePassport(app) {

    const { passport } = app.locals;

    passport.use('bearer', authentication.strategies.bearer);
    passport.use('anonymous', authentication.strategies.anonymous);

    return setupORCiDEndpoints(app);
}
