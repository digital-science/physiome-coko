const { models } = require('component-workflow-model/model');
const { Submission } = models;
const logger = require('workflow-utils/logger-with-prefix')('external-task/time-out-submission');


module.exports = function _setupTimeoutSubmissionTask(client) {

    client.subscribe('time-out-submission', async ({ task, taskService }) => {

        logger.debug(`timeout submission task is starting`);

        const submissionId = task.businessKey;
        if(!submissionId) {
            logger.warn(`failed to timeout submission due to missing business key (processInstanceId="${task.processInstanceId}")`);
            return taskService.complete(task);
        }

        const submission = await Submission.find(submissionId);
        if(!submission) {
            logger.warn(`unable to find submission instance for id (${submissionId})`);
            return taskService.complete(task);
        }

        submission.phase = "cancelled";
        await submission.save();

        logger.debug(`timeout submission completed, completing external task`);
        return taskService.complete(task);
    });
};
