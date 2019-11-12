// Note: we use Knex migration scripts to also manage the currently deployed version of the
//

const CurrentBPMFileName = 'physiome-submission.bpmn';

const path = require('path');
const fs = require('fs');

const DefinitionsPath = path.resolve(__dirname, '../../../definitions/');
const PhysiomeSubmissionBPMNPath = path.resolve(DefinitionsPath, CurrentBPMFileName);

const Deployer = require('../bpm-deployer');


exports.up = function(knex) {

    const fileContent = fs.readFileSync(PhysiomeSubmissionBPMNPath, 'utf8');
    return Deployer(CurrentBPMFileName, fileContent).then(r => {
        console.info(`Camunda BPM did deploy '${CurrentBPMFileName}' with ID: ${r.id} for key: ${r.key}`);
    });
};

exports.down = function(knex) {

    return Promise.resolve();
};

exports.config = { transaction: false };
