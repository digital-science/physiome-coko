const { models } = require('component-workflow-model/model');
const { Submission } = models;
const logger = require('workflow-utils/logger-with-prefix')('PhysiomeWorkflowTasks/FigshareArticlePublisher');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const { FigshareApi } = require('figshare-publish-service');
const uploadPMRArchiveToFigshare = require('./util-pmr-archive-upload');

const config = require('config');

const PublishFigshareOptions = config.get('figsharePublish');

const ArticleCategories = PublishFigshareOptions.categories ? PublishFigshareOptions.categories.split(',').map(v => parseInt(v.trim()))  : null;
const ArticleDefaultKeyword = PublishFigshareOptions.defaultTag;
const ArticleCustomFieldNames = PublishFigshareOptions.customFieldNames;

const ArticlePublishSkipPublishing = (PublishFigshareOptions.skipPublishingStage === true);

const ArticlePublishedDirectory = config.get('workflow-publish-output.directory');



function _submissionAuthorsToArticleAuthors(authors) {

    return authors.filter(a => a.name).map(author => {

        const a = {name: author.name};
        if(author.orcid && author.orcid.length) {
            a.orcid_id = author.orcid;
        }
        if(author.figshareUserId) {
            a.id = parseInt(author.figshareUserId);
        }
        return a;
    });
}


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

        const title = submission.title;
        const articleData = {
            title: title,
            defined_type: (PublishFigshareOptions.type || 'journal contribution'),
            categories: [],
            tags: [],
            references: [],
            description: submission.abstract || "No abstract was provided at the time of submission."
        };

        if(typeof PublishFigshareOptions.groupId === "number") {
            articleData.group_id = PublishFigshareOptions.groupId;
        }

        if(ArticleCategories) {
            articleData.categories = ArticleCategories;
        }

        if(submission.keywords && submission.keywords instanceof Array && submission.keywords.length) {
            articleData.tags = submission.keywords;
        }

        if(articleData.tags.indexOf(ArticleDefaultKeyword) === -1) {
            articleData.tags.push(ArticleDefaultKeyword);
        }


        // Append the custom meta-data field for IUPS Commission kind. The Displayed IUPS Commission kinds in the workflow
        // description are used as the figshare values (so convert from the enum to the mapped value).

        const workflowDescription = submission.constructor.workflowDescription;
        if(workflowDescription && submission.iupsCommission) {

            const commissionMapping = workflowDescription.resolveDisplayMapping('DisplayedIUPSCommissionKinds');
            if(commissionMapping) {
                const storedValueMapping = commissionMapping.internalValueMapping;
                if(storedValueMapping.hasOwnProperty(submission.iupsCommission)) {

                    if(!articleData.custom_fields) {
                        articleData.custom_fields = {};
                    }

                    if(ArticleCustomFieldNames.CommissionKind) {
                        articleData.custom_fields[ArticleCustomFieldNames.CommissionKind] = ["" + storedValueMapping[submission.iupsCommission]];
                    }
                }
            }
        }

        if(submission.primaryPapers && submission.primaryPapers.length) {

            const referenceUrls = submission.primaryPapers.map(citation => {
                return citation.doi ? citation.doi : citation.link || null;
            }).filter(v => !!v);

            if(referenceUrls && referenceUrls.length) {
                articleData.references = [...articleData.references, ...referenceUrls];
            }
        }

        if(submission.publishingPmrDetails && submission.publishingPmrDetails.workspaceId) {
            articleData.references.push(`https://models.physiomeproject.org/workspace/${encodeURI(submission.publishingPmrDetails.workspaceId)}`);
        }

        if(submission.funding && submission.funding.length) {

            const funding = [];

            submission.funding.forEach(f => {

                if(!f.organization || !f.organization.name) {
                    return;
                }

                if(!f.grants || !f.grants.length) {
                    return;
                }

                f.grants.forEach(grant => {

                    if(!grant.projectNumber) {
                        return;
                    }

                    const fundingDetails = {
                        funder_name: f.organization.name,
                        grant_code: grant.projectNumber,
                        is_user_defined: true
                    };

                    if(grant.entity) {
                        if(grant.entity.title) {
                            fundingDetails.title = grant.entity.title;
                        }

                        if(grant.entity.id) {
                            fundingDetails.url = `https://app.dimensions.ai/details/grant/${encodeURI(grant.entity.id)}`;
                        }
                    }


                    // Note: we overwrite what would be the better option above, replacing it with a more generic version
                    // as a single "title" string.
                    const reducedFundingDetails = {is_user_defined:true};

                    reducedFundingDetails.title = `${fundingDetails.funder_name}: ${grant.projectNumber}`;
                    if(grant.entity && grant.entity.title) {
                        reducedFundingDetails.title = `${reducedFundingDetails.title} - ${grant.entity.title}`
                    }

                    funding.push(reducedFundingDetails)
                });
            });

            if(funding.length) {
                articleData.funding_list = funding;
            }
        }

        // FIXME: if authors are greater than 10 we need to use the authors endpoint

        if(submission.authors && submission.authors instanceof Array && submission.authors.length) {
            articleData.authors = _submissionAuthorsToArticleAuthors(submission.authors);
        }

        return articleData;
    }


    // Publish a submission:
    // 1. Convert the current submission into the required figshare article data representation
    // 2. Either - create a new figshare article given the article data OR update the existing figshare article based
    //    on the new submission.
    // 3. Upload all associated files with the submission (first deleting any existing files associated with it).

    async _createOrUpdateSubmission(submission, articleData, authorFixCount) {

        const figshareApi = this.figshareApi;

        const submissionFuture = !submission.figshareArticleId ? figshareApi.createNewArticle(articleData).then(articleId => {

            submission.figshareArticleId = "" + articleId;

            return submission.patchFields(['figshareArticleId'], builder =>

                builder.whereNull('figshareArticleId')

            ).catch(err => {

                figshareApi.deleteArticle(articleId);
                return Promise.reject(err);

            }).then(() => {

                return {articleId:articleId, didFixAuthors: (authorFixCount > 0)};
            });

        }) : figshareApi.updateArticle(submission.figshareArticleId, articleData).then(r => {

            return {articleId: submission.figshareArticleId, didFixAuthors: (authorFixCount > 0)};
        });

        return submissionFuture.catch(async error => {

            // Catch any situations where one of the authors has a figshare account with an associated
            // ORCID identifier. Use the supplied author ID to perform a lookup of the author and associate the
            // authors figshare user ID back to the author in our data model.

            // Author "fixes" are limited to 5 users.

            if(!(submission.authors && submission.authors instanceof Array && submission.authors.length)) {
                return Promise.reject(error);
            }

            if(error.hasOwnProperty('responseBody') && error.hasOwnProperty('responseStatusCode')
                && error.responseStatusCode === 422 && authorFixCount < 5) {

                const responseBody = error.responseBody;
                if(responseBody.hasOwnProperty('code') && responseBody.hasOwnProperty('message')) {

                    const errorCode = responseBody.code;
                    const errorMessage = responseBody.message;

                    logger.info(`attempting to fix author with already used ORCID ID on figshare (message=${errorMessage})`);

                    if(errorCode && errorMessage && errorCode.toString() === "UnprocessableEntity") {

                        const matches = errorMessage.match(/Similar\s+user_id:\s+(\d+)/i);
                        if(matches && matches[1]) {

                            const figshareUserId = parseInt(matches[1]);
                            return figshareApi.getAuthor(figshareUserId).then(async authorDetails => {

                                if(authorDetails && authorDetails.orcid_id) {

                                    // Search through the submission for the matching author and record the figshare author ID
                                    // that should now be associated with the user.

                                    logger.debug(`did find matching user from figshare API (details=${JSON.stringify(authorDetails, null, 4)})`);

                                    const matchingAuthor = submission.authors.find(a => a.orcid && a.orcid.toLowerCase() === authorDetails.orcid_id.toLowerCase());
                                    if(!matchingAuthor) {
                                        return Promise.reject(new Error("unable to retrieve author details to fix author with ORCID ID already present"));
                                    }

                                    matchingAuthor.figshareUserId = figshareUserId;

                                    // Recreate the author details for the article data using the newly assigned figshare user ID associated with
                                    // the offending user.

                                    articleData.authors = _submissionAuthorsToArticleAuthors(submission.authors);

                                    return this._createOrUpdateSubmission(submission, articleData, authorFixCount + 1);
                                }

                                return Promise.reject(new Error("unable to retrieve author details to fix author with ORCID ID already present"));
                            });
                        }
                    }
                }
            }

            // All other errors are handled as per normal.
            return Promise.reject(error);
        });
    }

    async publishSubmission(submission) {

        const articleData = await this.submissionToArticleData(submission);
        const figshareApi = this.figshareApi;
        let fieldsModified = null;

        return this._createOrUpdateSubmission(submission, articleData, 0).then(async ({articleId, didFixAuthors}) => {

            if(didFixAuthors) {
                fieldsModified = ['authors'];
            }
            return this._publishFilesToArticleId(articleId, submission);

        }).then((articleId) => {

            // If the config option is set to skip publishing, then just return the final article ID here now and
            // don't perform the final publish stage.
            
            if(ArticlePublishSkipPublishing) {
                return {articleId, fieldsModified};
            }

            return figshareApi.publishArticle(articleId).then(() => {
                return {articleId, fieldsModified};
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

        return figshareApi.getArticleFileListing(articleId).then(async (currentFiles) => {

            if(currentFiles && currentFiles.length) {

                for(let i = 0; i < currentFiles.length; i++) {
                    await figshareApi.deleteFile(articleId, currentFiles[i]);
                }
            }

        }).then(async () => {

            // Iterate all of the submission files and upload each to the article within figshare.
            // Files must be both confirmed and not marked as being removed.

            const manuscriptFiles = (submission.articleFiles || []).slice(0).filter(f => f.confirmed && f.removed !== true);
            const supplementaryFiles = (submission.supplementaryFiles || []).slice(0).filter(f => f.confirmed && f.removed !== true);
            const files = [...manuscriptFiles, ...supplementaryFiles];

            for(let  i = 0; i < files.length; i++) {
                await this._uploadFileForArticle(articleId, submission, files[i]);
            }

            return Promise.resolve({articleId});

        }).then(async () => {

            return uploadPMRArchiveToFigshare(articleId, submission);

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
                        logger.warn(`S3 part stream read failed due to: ${error.toString()} (submission=${submission.id}, articleId=${articleId})`);
                        return reject(error);
                    });

                    const req = figshareApi.uploadFilePart(articleId, fileInfo, part);

                    req.on("error", (error) => {
                        logger.warn(`figshare part upload request failed due to: ${error.toString()} (submission=${submission.id}, articleId=${articleId})`);
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

    async publishToLocalFile(submission) {

        if(!ArticlePublishedDirectory) {
            return Promise.resolve(null);
        }

        const jsonObject = submission.toJSON();

        const submitter = jsonObject.submitter;
        if(submitter) {
            delete submitter.tokens;
            delete submitter.groups;

            delete submitter.emailValidationToken;
            delete submitter.emailValidationTokenExpire;
            delete submitter.emailValidationEmailSendTimes;
        }

        const jsonData = JSON.stringify(jsonObject, null, 4);

        return new Promise((resolve, reject) => {

            fs.mkdir(ArticlePublishedDirectory, { recursive: true }, (err, resultingPath) => {

                if(err && err.code !== 'EEXIST') {
                    logger.error(`creating local published directory failed due to: ${err.toString()}`);
                    return reject(err);
                }

                let filePath = path.join((resultingPath || ArticlePublishedDirectory), `${submission.manuscriptId}.json`);
                fs.writeFile(filePath, jsonData, {encoding:'utf8', flag:"w"}, (error) => {
                    if(err) {
                        logger.error(`creating local published directory failed due to: ${err.toString()}`);
                        return reject(err);
                    }
                    return resolve(filePath);
                });
            });
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