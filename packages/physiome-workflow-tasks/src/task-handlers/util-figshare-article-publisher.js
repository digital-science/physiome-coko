const { models } = require('component-workflow-model/model');
const { Submission } = models;


const { FigshareApi } = require('figshare-publish-service');
const crypto = require('crypto');



class FigshareArticlePublisher {

    constructor(figApi = FigshareApi) {
        this.figshareApi = figApi;
    }


    // Any fields that need to be loaded during the publishing process (see submissionToArticleData).
    get requiredSubmissionRelationFieldsForArticleData() {
        return ['submitter', 'articleFiles', 'supplementaryFiles'];
    }


    // Submission to Article Data
    // Convert a supplied submission into the figshare article representation. Any relations data that is required
    // should be already present (eagerly loaded via requiredSubmissionRelationFieldsForArticleData).

    async submissionToArticleData(submission) {

        // FIXME: we currently hardcode category 2 (uncategorized)

        const title = submission.title;
        const articleData = {
            title: title,
            defined_type: 'journal contribution',
            categories: [ 2 ],
            tags: [],
            group_id: 26065,
            description: submission.abstract || "No abstract was provided at the time of submission."
        };

        if(submission.keywords && submission.keywords instanceof Array && submission.keywords.length) {
            articleData.tags = submission.keywords;
        }

        // FIXME: if authors are greater than 10 we need to use the authors endpoint

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

        return articleData;
    }


    // Publish a submission:
    // 1. Convert the current submission into the required figshare article data representation
    // 2. Either - create a new figshare article given the article data OR update the existing figshare article based
    //    on the new submission.
    // 3. Upload all associated files with the submission (first deleting any existing files associated with it).

    async publishSubmission(submission) {

        const articleData = await this.submissionToArticleData(submission);
        const figshareApi = this.figshareApi;

        const createArticleIdPromise = !submission.figshareArticleId ? figshareApi.createNewArticle(articleData).then(articleId => {

            submission.figshareArticleId = "" + articleId;

            return submission.save().then(() => {
                return articleId;
            });

        }) : figshareApi.updateArticle(submission.figshareArticleId, articleData).then(r => {

            return submission.figshareArticleId;
        });

        return createArticleIdPromise.then(articleId => {

            return this._publishFilesToArticleId(articleId, submission);

        }).then((articleId) => {

            return figshareApi.publishArticle(articleId).then(() => {

                return articleId;
            });
        });
    }

    async republishSubmission(submission) {

        return this.publishSubmission(submission);
    }


    // Go through the current article file listing, deleting each existing file. We then iterate the submissions file
    // set and publish each file back into figshare.

    async _publishFilesToArticleId(articleId, submission) {

        const figshareApi = this.figshareApi;

        return figshareApi.getArticleFileListing(articleId).then((currentFiles) => {

            const p = [];

            if(currentFiles && currentFiles.length) {
                currentFiles.forEach(file => {
                    p.push(figshareApi.deleteFile(articleId, file));
                });
            }

            return Promise.all(p);

        }).then(() => {

            // Iterate all of the submission files and upload each to the article within figshare.
            // Files must be both confirmed and not marked as being removed.

            const manuscriptFiles = (submission.articleFiles || []).slice(0).filter(f => f.confirmed && f.removed !== true);
            const supplementaryFiles = (submission.supplementaryFiles || []).slice(0).filter(f => f.confirmed && f.removed !== true);
            const files = [...manuscriptFiles, ...supplementaryFiles];

            const __processNextFile = () => {
                if(!files.length) {
                    return Promise.resolve({articleId});
                }

                const file = files.shift();

                return this._uploadFileForArticle(articleId, submission, file).then(function() {
                    return __processNextFile();
                });
            };

            return __processNextFile();

        }).then(() => {

            return articleId;
        });
    }

    async _uploadFileForArticle(articleId, submission, file) {

        // Upload a file for a figshare article. We first determine an S3 object for it, calculate the MD5 checksum of the
        // file and then initiate and complete an upload into figshare.

        const s3Object = file.s3Object(submission.constructor, submission.id);
        const figshareApi = this.figshareApi;

        return _md5ForS3File(s3Object).then(md5 => {

            return figshareApi.initiateFileUpload(articleId, file.fileName, file.fileByteSize, md5);

        }).then(({fileInfo, uploadInfo}) => {

            const parts = uploadInfo.parts;

            function _uploadNextPart() {

                if(!parts.length) {
                    return {fileInfo, uploadInfo};
                }

                const part = parts.shift();
                const partStream = file.s3Object(Submission, submission.id, _s3ParametersForPartRange(part)).createReadStream();

                return new Promise((resolve, reject) => {

                    partStream.on('error', (error) => {
                        return reject(error);
                    });

                    const req = figshareApi.uploadFilePart(articleId, fileInfo, part);

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

            return figshareApi.completeFileUpload(articleId, fileInfo);
        });
    }
}



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


module.exports = FigshareArticlePublisher;