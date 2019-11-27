const TaskSendEmail = require('./util-task-send-email');
const logger = require('workflow-utils/logger-with-prefix')('PhysiomeWorkflowTasks/Email-ManuscriptRevisions');

class TaskSendRevisionsEmail extends TaskSendEmail {

    constructor(logger) {
        super('manuscript-revisions-needed', logger);
    }

    async formatEmailSubject(submission) {
        return `revisions needed for submission ${submission.manuscriptId}`;
    }
}

module.exports = function _setupEmailRevisionsTask(client) {

    const externalTaskName = 'revisions-needed-email';
    const task = new TaskSendRevisionsEmail(logger);

    task.configure(client, externalTaskName);
};