const TaskHandlers = require('./task-handlers/index');
const { Client } = require('camunda-external-task-client-js');
const config = require('config');
const logger = require('@pubsweet/logger');

exports.server = function setupWorkflow(app) {

    const clientConfig = { baseUrl: config.get('workflow.apiUri') };
    const client = new Client(clientConfig);

    logger.info("Workflow - setup external task handlers");
    TaskHandlers(client);
};
