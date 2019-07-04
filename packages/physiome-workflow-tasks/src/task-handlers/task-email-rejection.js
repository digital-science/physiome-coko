const { models } = require('component-workflow-model/model');
const { Submission } = models;
const logger = require('workflow-utils/logger-with-prefix')('external-task/email-manuscript-rejection');
const generateSendEmailHelper = require('../send-email-helper');


module.exports = function _setupEmailRejectionTask(client) {

    const sendManuscriptRejectionEmail = generateSendEmailHelper('manuscript-rejection');

    client.subscribe('rejection-email', async ({ task, taskService }) => {

        logger.debug(`send manuscript rejection email is starting`);

        const submissionId = task.businessKey;
        if(!submissionId) {
            // FIXME: may need to fail task here and report it
            logger.error(`failed to process email for submission due to missing business key (processInstanceId="${task.processInstanceId}")`);
            return;
        }

        const submission = await Submission.find(submissionId, ['submitter']);
        if(!submission) {
            logger.warn(`unable to find submission instance for id (${submissionId})`);
            return;
        }

        const user = submission.submitter;
        const data = {submission, user};

        return sendManuscriptRejectionEmail(user, 'Manuscript rejected', data).then(result => {

            logger.debug(`email for manuscript rejection was sent, completing external task`);
            return taskService.complete(task);

        }).catch(err => {

            logger.error(`sending email for manuscript rejection failed due to: ${err.toString()}`);
        });
    });
};
