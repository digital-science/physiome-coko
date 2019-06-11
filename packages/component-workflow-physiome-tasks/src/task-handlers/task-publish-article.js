const { models } = require('component-workflow-model/model');
const { Submission } = models;

const { FigshareApi } = require('figshare-publish-service');
const crypto = require('crypto');

const logger = require("@pubsweet/logger");
const LogPrefix = '[ExternalTask/PublishArticle]';


module.exports = function _setupPublishArticleTask(client) {

    client.subscribe('publish-article', async ({ task, taskService }) => {

        logger.debug(`${LogPrefix} publish article is starting {submission_id: ${task.businessKey}}`);

        const instanceId = task.businessKey;
        if(!instanceId) {
            logger.error(`${LogPrefix} failed to process for submission due to missing business key (processInstanceId="${task.processInstanceId}")`);
            return taskService.handleFailure(task, {
                errorMessage: "Publish Article Failed",
                errorDetails: `Publish article task had no valid business key associated with the external service task.`,
                retries: 0,
                retryTimeout: 0
            });
        }

        const submission = await Submission.find(instanceId, ['articleFiles', 'submitter']);
        if(!submission) {
            logger.warn(`${LogPrefix} unable to find submission instance for id (${instanceId})`);
            return;
        }

        _publishSubmission(submission).then(() => {

            submission.phase = 'published';
            submission.publishDate = new Date();
            return submission.save();

        }).then(() => {

            logger.debug(`${LogPrefix} publishing submission article to figshare has finished, completing external task`);
            return taskService.complete(task);

        }).catch(err => {

            logger.error(`${LogPrefix} failed due to error: ${err.toString()}`);
            /*return taskService.handleFailure(task, {
                errorMessage: "Publish Award Failed",
                errorDetails: `Unable to publish award due to: ${err.toString()}`,
                retries: 5,
                retryTimeout: 5000
            });*/
        });
    });
};


function _md5ForS3File(s3Object) {

    // FIXME: probably a better way of keeping track of the MD5, perhaps the client can calc. when sending originally via S3 upload process?

    return new Promise((resolve, reject) => {

        const rs = s3Object.createReadStream();

        const hash = crypto.createHash('md5');
        hash.setEncoding('hex');

        rs.on('end', function() {
            hash.end();
            return resolve(hash.read());
        });
        rs.on('error', error => {
            return reject(error);
        });

        rs.pipe(hash);
    });
}

function _s3ParametersForPartRange(part) {

    return {Range:`bytes=${part.startOffset}-${part.endOffset}`};
}



function _publishSubmission(submission) {

    // FIXME: replace hard-coded values for published awards (based on full submission data field set)

    const title = submission.title;
    const articleData = {
        title: title,
        categories: [ 2 ],
        tags: [
            "Demo Physiome Article"
        ],
        description: submission.abstract || "No article description was provided at the time of submission."
    };


    if(submission.authors && submission.authors instanceof Array && submission.authors.length) {

        articleData.authors = submission.authors.filter(a => a.name).map(author => {

            return {name: author.name};

            /*const a = {name: `${awardee.firstName} ${awardee.lastName}`};
            if(awardee.identity && awardee.identity.type === 'orcid') {
                a.orcid_id = awardee.identity.identityId;
            }
            return a;*/
        });
    }

    const createArticleIdPromise = !submission.figshareArticleId ? FigshareApi.createNewArticle(articleData).then(articleId => {

        submission.figshareArticleId = "" + articleId;

        return submission.save().then(() => {
            return articleId;
        });

    }) : Promise.resolve(submission.figshareArticleId);


    return createArticleIdPromise.then(articleId => {

        return _publishToArticleId(articleId, submission);

    }).then((articleId) => {

        return FigshareApi.publishArticle(articleId).then(() => {

            return articleId;
        });
    })
}



function _publishToArticleId(articleId, submission) {

    // Delete all the pre-existing files associated with this article, the steps after this will re-add any removed file.

    return FigshareApi.getArticleFileListing(articleId).then((currentFiles) => {

        const p = [];

        if(currentFiles && currentFiles.length) {
            currentFiles.forEach(file => {
                p.push(FigshareApi.deleteFile(articleId, file));
            });
        }

        return Promise.all(p);

    }).then(() => {

        // Iterate all of the submission files and upload each to the article within figshare.
        const files = (submission.articleFiles || []).slice(0).filter(f => f.confirmed);

        function __processNextFile() {
            if(!files.length) {
                return Promise.resolve({articleId});
            }

            const file = files.shift();

            return _uploadFileForArticle(articleId, submission, file).then(function() {
                return __processNextFile();
            });
        }

        return __processNextFile();

    }).then(() => {

        return articleId;
    });
}


function _uploadFileForArticle(articleId, submission, file) {

    const s3Object = file.s3Object("Submission", submission.id);

    return _md5ForS3File(s3Object).then(md5 => {

        return FigshareApi.initiateFileUpload(articleId, file.fileName, file.fileByteSize, md5);

    }).then(({fileInfo, uploadInfo}) => {

        const parts = uploadInfo.parts;

        function _uploadNextPart() {

            if(!parts.length) {
                return {fileInfo, uploadInfo};
            }

            const part = parts.shift();
            const partStream = file.s3Object("Submission", submission.id, _s3ParametersForPartRange(part)).createReadStream();

            return new Promise((resolve, reject) => {

                partStream.on('error', (error) => {
                    return reject(error);
                });

                const req = FigshareApi.uploadFilePart(articleId, fileInfo, part);

                req.on("error", (error) => {
                    console.error("");
                    return reject(error);
                });

                partStream.pipe(req);

                req.on("end", () => {
                    return resolve(_uploadNextPart());
                });
            });
        }

        return _uploadNextPart();

    }).then(({fileInfo}) => {

        return FigshareApi.completeFileUpload(articleId, fileInfo);
    });
}