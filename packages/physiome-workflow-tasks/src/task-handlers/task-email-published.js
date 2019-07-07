const TaskSendEmail = require('./util-task-send-email');
const logger = require('workflow-utils/logger-with-prefix')('external-task/email-manuscript-published');

class TaskSendPublishedEmail extends TaskSendEmail {

    constructor(logger) {
        super('manuscript-published', logger);
    }

    async formatEmailSubject(submission) {
        return `published ${submission.manuscriptId}`;
    }
}

module.exports = function _setupEmailPublishedTask(client) {

    const externalTaskName = 'published-email';
    const task = new TaskSendPublishedEmail(logger);

    task.configure(client, externalTaskName);
};
