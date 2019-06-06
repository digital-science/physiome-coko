/* eslint-disable */

process.env.NODE_CONFIG_DIR = './packages/app/config/';

const CamSDK = require('camunda-bpm-sdk-js');
const config = require('config');
const path = require('path');
const fs = require('fs');

const camundaApiUri = config.get('workflow.apiUri');
if (!camundaApiUri) {
    console.error("config does not have 'workflow.apiUri' specified.");
    return;
}

const deploymentName = config.get('workflow.deploymentName');
if (!deploymentName) {
    console.error("config does not have 'workflow.deploymentName' specified.");
    return;
}

const deploymentFiles = config.get('workflow.deploymentFiles');
if (!deploymentFiles) {
    console.error("config does not have 'workflow.deploymentFiles' specified.");
    return;
}

const deploymentFilesSource = config.get('workflow.deploymentFilesSource');
if (!deploymentFilesSource) {
    console.error("config does not have 'workflow.deploymentFilesSource' specified.");
    return;
}


const camClient = new CamSDK.Client({
    mock: false,
    apiUri: camundaApiUri
});


const resolvedFileSource = path.resolve(deploymentFilesSource);
const files = deploymentFiles.map(file => {
    return {
        name: file,
        content: fs.readFileSync(path.join(resolvedFileSource, file), "utf8")
    }
});

const deploymentService = new camClient.resource('deployment');
const deploymentOpts = {
    deploymentName,
    files
};

deploymentService.create(deploymentOpts, (err, results) => {

    if (err) {
        console.dir(err);
        return;
    }

    console.info(JSON.stringify(results, null, 4));
    console.info("-----------------");
    console.info("");
    console.info("");

    const processDefID = Object.keys(results.deployedProcessDefinitions)[0];

    console.log("Process Definition ID: " + processDefID.id);

    console.log("");
    console.log("");
    console.log("-----------------");

    /*const processDefID = Object.keys(results.deployedProcessDefinitions)[0];
    const processDefStartOptions = {
        id: processDefID
    };

    processDefinitionService.start(processDefStartOptions, (err, results) => {

        if(err) {
            console.dir(err);
            return;
        }

        console.log(JSON.stringify(results, null, 4));
    });*/

});




