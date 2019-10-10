const { deferConfig } = require('config/defer');

module.exports = {

    'pubsweet-server': {
        baseUrl: deferConfig(
            cfg => `http://localhost:${cfg['pubsweet-server'].port}`,
        ),
    },

    dbManager: {
        username: 'admin',
        password: 'password',
        email: 'admin@example.com',
        admin: true,
    },

    identity: {
        validationTokenExpireDays: 15,
        maximumEmailValidationsPerDay: 5,
        adminIdentities: [
            "0000-0001-9332-2604"
        ]
    }
};
