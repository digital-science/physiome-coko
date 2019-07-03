const { models } = require('component-workflow-model/model');
const { Submission } = models;
const logger = require('workflow-utils/logger-with-prefix')('external-task/reserve-doi');

const { FigshareApi } = require('figshare-publish-service');


module.exports = function _setupReserveDoiTask(client) {

    client.subscribe('reserve-doi', async ({ task, taskService }) => {

        logger.debug(`reserve doi task is starting`);

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

        return _reserveDoiForSubmission(submission).then(async article => {

            if(!article || !article.doi) {
                logger.error(`reserve doi was unable to retrieve the DOI or article details for the Figshare article (submissionId = ${submissionId})`);
                return;
            }

            submission.figshareArticleDoi = article.doi;
            await submission.save();

            logger.debug(`reserve doi completed, completing external task`);
            return taskService.complete(task);

        }).catch(err => {

            logger.error(`unable to reserve doi for submission due to: ${err.toString()} (submissionId = ${submissionId})`);

            // FIXME: apply a better back-off approach here...
        });
    });
};


function _reserveDoiForSubmission(submission) {

    const articleData = {
        title: submission.title,
        categories: [ 2 ],
        tags: [
            "Demo Physiome Article"
        ],
        description: submission.abstract || "No article description was provided at the time of submission."
    };


    if(submission.authors && submission.authors instanceof Array && submission.authors.length) {

        articleData.authors = submission.authors.filter(a => a.name).map(author => {
            return {name: author.name};
        });
    }

    const createArticleIdPromise = !submission.figshareArticleId ? FigshareApi.createNewArticle(articleData).then(articleId => {

        submission.figshareArticleId = "" + articleId;

        // FIXME: change to a transaction maybe??

        return submission.save().then(() => {
            return articleId;
        });

    }) : Promise.resolve(submission.figshareArticleId);

    return createArticleIdPromise.then(figshareArticleId => {

        return FigshareApi.reserveArticleDoi(figshareArticleId).then(() => {
            return figshareArticleId;
        });

    }).then(figshareArticleId => {

        return FigshareApi.getArticle(figshareArticleId);
    });
}
