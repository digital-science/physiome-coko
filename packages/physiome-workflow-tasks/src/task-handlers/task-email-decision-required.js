const TaskSendEmail = require('./util-task-send-email');
const logger = require('workflow-utils/logger-with-prefix')('PhysiomeWorkflowTasks/Email-EditorManuscriptDecision');

const config = require('config');
const EditorsMailingListAddress = config.get('workflow-send-email.editorsMailingListAddress');

if(!EditorsMailingListAddress) {
    logger(`configuration option for editors mailing list not defined`);
}


class TaskSendDecisionRequiredEmail extends TaskSendEmail {

    constructor(logger) {
        super('manuscript-decision-required-editor-list', logger);
    }

    async formatEmailSubject(submission) {
        return `Editorial Decision: required for submission ${submission.manuscriptId}`;
    }

    async submissionToRecipient(submission) {
        return {
            displayName: 'Physiome Editors',
            email: EditorsMailingListAddress
        };
    }

    skipTaskWithoutSendingEmail() {
        return !EditorsMailingListAddress;
    }
}

module.exports = function _setupEmailInitialSubmissionTask(client) {

    const externalTaskName = 'decision-required-email';
    const task = new TaskSendDecisionRequiredEmail(logger);

    task.configure(client, externalTaskName);
};
