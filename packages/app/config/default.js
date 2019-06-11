require('dotenv').config();
const path = require('path');
const logger = require('./loggerCustom');
const components = require('./components.json');


const getDbConfig = () => {
    if (process.env.DATABASE) {
        return {
            user: process.env.DB_USER,
            password: process.env.DB_PASS,
            database: process.env.DATABASE,
            host: process.env.DB_HOST,
            port: 5432,
            ssl: false,
            newJobCheckIntervalSeconds: 3600,
            expireCheckIntervalMinutes: 60
        };
    }
    return {};
};

const values = {
    // Public keys are copied into webpack build (i.e. go client-side)
    publicKeys: ['pubsweet-client', 'authsome', 'validations', 'orcid-paths'],

    authsome: {
        mode: path.resolve(__dirname, 'authsome-mode.js'),
        teams: {
            handlingEditor: {
                name: 'Handling Editors'
            },
            reviewer: {
                name: 'Reviewer'
            }
        }
    },
    validations: path.resolve(__dirname, 'validations.js'),
    pubsweet: {
        components
    },
    dbManager: {
        migrationsPath: path.join(process.cwd(), 'migrations')
    },
    'pubsweet-server': {
        db: getDbConfig(),
        pool: { min: 0, max: 10 },
        ignoreTerminatedConnectionError: true,
        port: 3000,
        logger,
        uploads: 'uploads',
        secret: 'SECRET',
        enableExperimentalGraphql: true,
        graphiql: true
    },
    'pubsweet-client': {
        API_ENDPOINT: '/api',
        baseUrl: process.env.CLIENT_BASE_URL || 'http://localhost:3000',
        'login-redirect': '/',
        theme: process.env.PUBSWEET_THEME
    },
    orcid: {
        clientID: process.env.ORCID_CLIENT_ID,
        clientSecret: process.env.ORCID_CLIENT_SECRET,

        orcidUrl: 'sandbox.orcid.org',
        orcidDisplayUrl: 'orcid.org',

        authenticatePath: '/orcid/authenticate',
        callbackPath: '/orcid/callback',

        associatePath: '/orcid/link',
        associateCallbackPath: '/orcid/associate',

        successPath: '/'
    },
    'mail-transport': {
        sendmail: true
    },
    'pubsweet-component-aws-s3': {
        secretAccessKey: process.env.AWS_S3_SECRET_KEY,
        accessKeyId: process.env.AWS_S3_ACCESS_KEY,
        region: process.env.AWS_S3_REGION,
        bucket: process.env.AWS_S3_BUCKET,
        validations: path.resolve(__dirname, 'upload-validations.js')
    },
    mailer: {
        from: 'j.watts@digital-science.com',
        path: `${__dirname}/mailer`
    },
    SES: {
        accessKey: process.env.AWS_SES_ACCESS_KEY,
        secretKey: process.env.AWS_SES_SECRET_KEY,
        region: process.env.AWS_SES_REGION
    },
    workflow: {
        apiUri: process.env.WORKFLOW_API_URI || 'http://127.0.0.1:8080/engine-rest',
        deploymentName: 'physiome-submission'
    },
    'workflow-files': {
        secretAccessKey: process.env.AWS_S3_SECRET_KEY,
        accessKeyId: process.env.AWS_S3_ACCESS_KEY,
        region: process.env.AWS_S3_REGION,
        bucket: process.env.AWS_S3_BUCKET
    },
    'workflow-send-email' : {
        from: 'jaredwatts@gmail.com',
        prefix: '[DEV] ',
        templateDirectory: `${__dirname}/../../../definitions/email-templates`,
        restrictedEmailAddresses: [
            'j.watts@digital-science.com',
            's.porter@digital-science.com',
            't.kuznetsova@digital-science.com',
            's.grimme@digital-science.com'
        ]
    },
    figshare: {
        apiBaseUrl: process.env.FIGSHARE_API_BASE,
        apiToken: process.env.FIGSHARE_API_TOKEN
    },
    logging: {
        debugAclRules: true
    }
};

values['orcid-paths'] = {
    orcidUrl: values.orcid.orcidUrl,
    orcidDisplayUrl: values.orcid.orcidDisplayUrl,
    authenticatePath: values.orcid.authenticatePath,
    associatePath: values.orcid.associatePath
};

module.exports = values;