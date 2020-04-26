const { models } = require('component-workflow-model/model');
const { Submission } = models;
const logger = require('workflow-utils/logger-with-prefix')('PhysiomeWorkflowTasks/RejectionCleanup');
const { transaction } = require('objection');
const fs = require('fs');
const path = require('path');

const { FigshareApi, NotFoundError } = require('figshare-publish-service');

const config = require('config');
const ArticlePublishedDirectory = config.get('workflow-publish-output.directory');


module.exports = function _setupRejectionCleanupTask(client) {

    client.subscribe('rejection-cleanup', async ({ task, taskService }) => {

        logger.debug(`rejection cleanup task is starting`);

        const submissionId = task.businessKey;
        if(!submissionId) {
            logger.warn(`failed to timeout submission due to missing business key (processInstanceId="${task.processInstanceId}")`);
            return;
        }

        const submission = await Submission.find(submissionId);
        if(!submission) {
            logger.warn(`unable to find submission instance for id (${submissionId})`);
            return;
        }

        return _cleanupForRejectedSubmission(submission).then(async () => {

            logger.debug(`cleanup article rejection completed, completing external task`);
            return taskService.complete(task);

        }).catch(err => {

            logger.error(`unable to cleanup figshare article for submission due to: ${err.toString()} (submissionId = ${submissionId})`);
            // FIXME: apply a better back-off approach here...
        });
    });
};

function removeLocalPublishedVersion(submission) {

    if(ArticlePublishedDirectory && submission.manuscriptId) {

        const finalFilePath = path.join(ArticlePublishedDirectory, `${submission.manuscriptId}.json`);

        return new Promise((resolve, reject) => {
            fs.unlink(finalFilePath, () => {
                return resolve(true);
            });
        });
    }

    return Promise.resolve(false);
}


async function _cleanupForRejectedSubmission(submission) {

    await removeLocalPublishedVersion(submission);

    if(!submission.figshareArticleId) {
        logger.debug(`no figshare article to cleanup (submissionId = ${submission.id}, phase = ${submission.phase})`);
        return;
    }

    if(submission.phase !== 'reject') {
        logger.warn(`phase for submission wasn't 'reject' (submissionId = ${submission.id}, phase = ${submission.phase})`);
        return;
    }

    const articleId = submission.figshareArticleId;

    logger.debug(`will delete figshare article (submissionId = ${submission.id}, phase = ${submission.phase}, articleId = ${articleId})`);

    return FigshareApi.deleteArticle(articleId).then(() => {

        logger.debug(`did delete figshare article (submissionId = ${submission.id}, phase = ${submission.phase}, articleId = ${articleId})`);

        submission.figshareArticleId = null;
        submission.figshareArticleDoi = null;
        return submission.patchFields(['figshareArticleId', 'figshareArticleDoi'], builder => builder.where('figshareArticleId', articleId));

    }).catch(error => {

        if(!error instanceof NotFoundError) {
            throw error;
        }

        logger.debug(`figshare article not found during deletion attempt (submissionId = ${submission.id}, phase = ${submission.phase}, articleId = ${articleId})`);

        submission.figshareArticleId = null;
        submission.figshareArticleDoi = null;
        return submission.patchFields(['figshareArticleId', 'figshareArticleDoi'], builder => builder.where('figshareArticleId', articleId));
    });
}
