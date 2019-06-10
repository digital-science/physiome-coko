const config = require('config');
const CamSDK = require('camunda-bpm-sdk-js');


module.exports = function deployBPMFile(fileName, fileContent) {

    const camundaApiUri = config.get('workflow.apiUri');
    if (!camundaApiUri) {
        return Promise.reject(new Error("config does not have 'workflow.apiUri' specified."));
    }

    const deploymentName = config.get('workflow.deploymentName');
    if (!deploymentName) {
        return Promise.reject(new Error("config does not have 'workflow.deploymentName' specified."));
    }

    const camClient = new CamSDK.Client({
        mock: false,
        apiUri: camundaApiUri
    });

    const files = [
        {
            name: fileName,
            content: fileContent
        }
    ];

    const deploymentService = new camClient.resource('deployment');
    const deploymentOpts = {
        deploymentName,
        files
    };

    return new Promise((resolve, reject) => {

        deploymentService.create(deploymentOpts, (err, results) => {
            if (err) {
                return reject(err);
            }
            return resolve(Object.values(results.deployedProcessDefinitions)[0]);
        });
    });

};