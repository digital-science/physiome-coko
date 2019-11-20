const FigshareArticlePublisher = require('./util-figshare-article-publisher');
const { models } = require('component-workflow-model/model');
const { Submission } = models;

const TaskLockExtender = require('./util-lock-extender');
const logger = require("workflow-utils/logger-with-prefix")('PhysiomeWorkflowTasks/RepublishArticle');


module.exports = function _setupRepublishArticleTask(client) {

    const articlePublisher = new FigshareArticlePublisher();

    client.subscribe('republish-article', async ({ task, taskService }) => {

        logger.debug(`republish article is starting {submissionId: ${task.businessKey}}`);

        const instanceId = task.businessKey;
        if(!instanceId) {
            logger.error(`failed to process republish submission due to missing business key (processInstanceId="${task.processInstanceId}")`);
            return taskService.handleFailure(task, {
                errorMessage: "Republish article failed",
                errorDetails: `Republish article task had no valid business key associated with the external service task.`,
                retries: 0,
                retryTimeout: 0
            });
        }

        const submission = await Submission.find(instanceId, articlePublisher.requiredSubmissionRelationFieldsForArticleData);
        if(!submission) {
            logger.warn(`unable to find submission instance for id (${instanceId})`);
            return;
        }

        // Create a lock extender, which will on a regular basis
        const lockExtender = new TaskLockExtender(taskService, task);
        await lockExtender.extend(60);

        lockExtender.start();

        return articlePublisher.republishSubmission(submission).then(() => {

            const currentDate = new Date();

            submission.phase = 'published';
            if(!submission.publishDate) {
                submission.publishDate = currentDate;
            }
            submission.lastPublishDate = currentDate;
            submission.unpublishedChanges = false;

            return submission.patchFields(['phase', 'publishDate', 'lastPublishDate', 'unpublishedChanges']);

        }).then(async () => {

            await lockExtender.stop();

            logger.debug(`republishing article to figshare has finished, completing external task`);
            return taskService.complete(task);

        }).then(() => {

            return Promise.all([
                submission.publishWasModified(),
                submission.publishSimpleMessage('published', {
                    publishedSubmission: submission.id
                })
            ]);

        }).catch(err => {

            logger.error(`unable to re-publish article into figshare due to: ` + err.toString());

        }).finally(() => {

            lockExtender.stop();
        });
    });
};
