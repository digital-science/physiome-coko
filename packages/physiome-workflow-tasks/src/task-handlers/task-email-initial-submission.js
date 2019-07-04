const { models } = require('component-workflow-model/model');
const { Submission } = models;
const logger = require('workflow-utils/logger-with-prefix')('external-task/initial-submission-email');
const generateSendEmailHelper = require('../send-email-helper');


module.exports = function _setupEmailInitialSubmissionTask(client) {

    const sendInitialSubmissionEmail = generateSendEmailHelper('initial-submission');

    client.subscribe('initial-submission-email', async ({ task, taskService }) => {

        logger.debug(`send initial submission email is starting`);

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

        return sendInitialSubmissionEmail(user, 'Manuscript submission received', data).then(result => {

            logger.debug(`email for initial submission was sent, completing external task`);
            return taskService.complete(task);

        }).catch(err => {

            logger.error(`sending email for initial manuscript submission failed due to: ${err.toString()}`);
        });
    });
};
