const TaskSendEmail = require('./util-task-send-email');
const logger = require('workflow-utils/logger-with-prefix')('external-task/email-manuscript-rejection');

class TaskSendRejectionEmail extends TaskSendEmail {

    constructor(logger) {
        super('manuscript-rejection', logger);
    }

    async formatEmailSubject(submission) {
        return `rejection of submission ${submission.manuscriptId}`;
    }
}

module.exports = function _setupEmailRejectionTask(client) {

    const externalTaskName = 'rejection-email';
    const task = new TaskSendRejectionEmail(logger);

    task.configure(client, externalTaskName);
};