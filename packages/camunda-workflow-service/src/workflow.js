const CamSDK = require('camunda-bpm-sdk-js');
const config = require('config');

const camClient = new CamSDK.Client({
    mock: false,
    apiUri: config.workflow.apiUri
});

exports.client = camClient;
exports.taskService = new camClient.resource('task');
exports.processDefinitionService = new camClient.resource('process-definition');
exports.processInstanceService = new camClient.resource('process-instance');
