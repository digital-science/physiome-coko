/* eslint-disable */

process.env.NODE_CONFIG_DIR = './packages/app/config/';

const CamSDK = require('camunda-bpm-sdk-js');
const config = require('config');

const camundaApiUri = config.get('workflow.apiUri');
if (!camundaApiUri) {
    console.error("config does not have 'workflow.apiUri' specified.");
    return;
}

const camClient = new CamSDK.Client({
    mock: false,
    apiUri: camundaApiUri
});

const processDefinitionService = new camClient.resource('process-definition');

const processDefStartOptions = {
    //id: config.get('workflow.processDefinitionId')
    key: "award-submission"
};

return processDefinitionService.start(processDefStartOptions).then((data) => {

    console.log(JSON.stringify(data, null, 4));
    return data;

}).catch((err) => {

    console.error("BPM engine request failed due to: " + err.toString());
    return Promise.reject(new Error("Unable to fetch submissions due to business engine error."));
});

