const FigshareArticlePublisher = require('./util-figshare-article-publisher');
const { models } = require('component-workflow-model/model');
const { Submission } = models;

const TaskLockExtender = require('./util-lock-extender');
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

        // Create a lock extender, which will on a regular basis
        const lockExtender = new TaskLockExtender(taskService, task);
        await lockExtender.extend(60);

        lockExtender.start();

        return articlePublisher.publishSubmission(submission).then(({fieldsModified}) => {

            const currentDate = new Date();

            submission.phase = 'published';
            if(!submission.publishDate) {
                submission.publishDate = currentDate;
            }
            submission.lastPublishDate = currentDate;
            submission.unpublishedChanges = false;

            let fieldsList = ['phase', 'publishDate', 'lastPublishDate', 'unpublishedChanges'];
            if(fieldsModified) {
                fieldsModified.forEach(field => {
                    if(fieldsList.indexOf(field) === -1) {
                        fieldsList.push(field);
                    }
                });
            }

            return submission.patchFields(fieldsList);

        }).then(async () => {

            return articlePublisher.publishToLocalFile(submission);

        }).then(async () => {

            await lockExtender.stop();

            logger.debug(`publishing article to figshare has finished, completing external task`);
            return taskService.complete(task);

        }).then(() => {

            return Promise.all([
                submission.publishWasModified(),
                submission.publishSimpleMessage('published', {
                    publishedSubmission: submission.id
                })
            ]);

        }).catch(err => {

            logger.error(`unable to publish article into figshare due to: ` + err.toString());

            /*return taskService.handleFailure(task, {
                errorMessage: "Publish Submission Failed",
                errorDetails: `Unable to publish submission [${submission.manuscriptId}} due to: ${err.toString()}`,
                retries: 5,
                retryTimeout: 5000
            });*/

        }).finally(() => {

            lockExtender.stop().catch(err => {
                logger.error(`lock extender stopping failed due to: ` + err.toString());
            });
        });

    });
};
