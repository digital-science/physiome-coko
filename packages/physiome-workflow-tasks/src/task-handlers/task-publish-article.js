const FigshareArticlePublisher = require('./util-figshare-article-publisher');
const { models } = require('component-workflow-model/model');
const { Submission } = models;

const logger = require("workflow-utils/logger-with-prefix")('PhysiomeWorkflowTasks/PublishArticle');


module.exports = function _setupPublishArticleTask(client) {

    const articlePublisher = new FigshareArticlePublisher();

    client.subscribe('publish-article', async ({ task, taskService }) => {

        logger.debug(`publish article is starting {submissionId: ${task.businessKey}}`);

        const instanceId = task.businessKey;
        if(!instanceId) {
            logger.error(`failed to process publish submission due to missing business key (processInstanceId="${task.processInstanceId}")`);
            return taskService.handleFailure(task, {
                errorMessage: "Publish Article Failed",
                errorDetails: `Publish article task had no valid business key associated with the external service task.`,
                retries: 0,
                retryTimeout: 0
            });
        }

        const submission = await Submission.find(instanceId, articlePublisher.requiredSubmissionRelationFieldsForArticleData);
        if(!submission) {
            logger.warn(`unable to find submission instance for id (${instanceId})`);
            return;
        }

        return articlePublisher.publishSubmission(submission).then(() => {

            // FIXME: this should be updated via patching as the publish can take a long time and the submission may get modified during this time period

            const currentDate = new Date();

            submission.phase = 'published';
            if(!submission.publishDate) {
                submission.publishDate = currentDate;
            }
            submission.lastPublishDate = currentDate;
            submission.unpublishedChanges = false;

            return submission.save();

        }).then(() => {

            logger.debug(`publishing article to figshare has finished, completing external task`);
            return taskService.complete(task);

        }).then(() => {

            return submission.publishWasModified();

        }).catch(err => {

            logger.error(`unable to publish article into figshare due to: ` + err.toString());

            /*return taskService.handleFailure(task, {
                errorMessage: "Publish Submission Failed",
                errorDetails: `Unable to publish submission [${submission.manuscriptId}} due to: ${err.toString()}`,
                retries: 5,
                retryTimeout: 5000
            });*/

        });

    });
};
