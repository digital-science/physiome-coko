const TaskSendEmail = require('./util-task-send-email');
const logger = require('workflow-utils/logger-with-prefix')('PhysiomeWorkflowTasks/Email-InitialSubmission');

class TaskSendInitialSubmissionEmail extends TaskSendEmail {

    constructor(logger) {
        super('manuscript-initial-submission-author', logger);
    }

    async formatEmailSubject(submission) {
        return `submission ${submission.manuscriptId}`;
    }
}

module.exports = function _setupEmailInitialSubmissionTask(client) {

    const externalTaskName = 'initial-submission-email';
    const task = new TaskSendInitialSubmissionEmail(logger);

    task.configure(client, externalTaskName);
};
