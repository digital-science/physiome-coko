const TaskSendEmail = require('./util-task-send-email');
const logger = require('workflow-utils/logger-with-prefix')('external-task/email-manuscript-acceptance');

class TaskSendAcceptanceEmail extends TaskSendEmail {

    constructor(logger) {
        super('manuscript-acceptance', logger);
    }

    async formatEmailSubject(submission) {
        return `acceptance of submission ${submission.manuscriptId}, request for payment`;
    }
}

module.exports = function _setupEmailAcceptanceTask(client) {

    const externalTaskName = 'acceptance-email';
    const task = new TaskSendAcceptanceEmail(logger);

    task.configure(client, externalTaskName);
};
