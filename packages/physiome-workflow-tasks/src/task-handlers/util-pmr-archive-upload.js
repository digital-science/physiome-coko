const PassThrough = require('stream').PassThrough;
const crypto = require('crypto');
const path = require('path');
const fs = require('fs');
const os = require('os');


const { FigshareApi } = require('figshare-publish-service');
const request = require('request');

const logger = require('workflow-utils/logger-with-prefix')('PhysiomeWorkflowTasks/PMRArchiveUpload');



async function uploadPMRArchiveToFigshare(articleId, submission) {

    const { workspaceId, changeSetHash } = submission.publishingPmrDetails;
    const archiveDownloadLink = workspaceId && changeSetHash ? `https://models.physiomeproject.org/workspace/${encodeURI(workspaceId)}/@@archive/${encodeURI(changeSetHash)}/tgz` : null;

    return _createTemporaryDirectory(submission.manuscriptId).then(tempDirectory => {

        const archiveFilePath = path.join(tempDirectory, 'model-archive.tar.gz');
        const fileStream = fs.createWriteStream(archiveFilePath);

        const p = new Promise((resolve, reject) => {

            const md5HashStream = new PassThrough();
            const md5Hash = crypto.createHash('md5');
            let fileByteCount = 0;

            md5HashStream.on('data', chunk => {
                md5Hash.update(chunk);
                fileByteCount += chunk.length;
            });

            const archiveDownloadStream = request({
                uri: archiveDownloadLink,
                headers: {
                    'Accept': 'application/x-tar',
                },
                gzip: true
            })
            .pipe(md5HashStream)
            .pipe(fileStream)
            .on('finish', () => {

                const md5 = md5Hash.digest('hex');

                logger.debug(`completed downloading archive file (submission=${submission.id}, articleId=${articleId}, tempArchivePath='${archiveFilePath}', byteCount=${fileByteCount}, md5=${md5})`);

                return resolve({
                    size: fileByteCount,
                    md5: md5
                });
            })
            .on('error', (error) => {
                reject(error);
            });
        });

        return p.then(({size, md5}) => {

            logger.debug(`initiate figshare file upload (submission=${submission.id}, articleId=${articleId}, fileName=pmr-model-archive.tar.gz, byteCount=${size}, md5=${md5})`);
            return FigshareApi.initiateFileUpload(articleId, 'pmr-model-archive.tar.gz', size, md5);

        }).then(({fileInfo, uploadInfo}) => {

            const parts = uploadInfo.parts;
            logger.debug(`figshare upload starting with ${parts.length} parts (submission=${submission.id}, articleId=${articleId})`);

            function _uploadNextPart() {

                if(!parts.length) {
                    logger.debug(`completed uploading all parts to figshare (submission=${submission.id}, articleId=${articleId})`);
                    return {fileInfo, uploadInfo};
                }

                const part = parts.shift();
                const partStream = fs.createReadStream(archiveFilePath, {start:part.startOffset, end:part.endOffset, highWaterMark:(128 * 1024)});

                return new Promise((resolve, reject) => {

                    partStream.on('error', (error) => {
                        return reject(error);
                    });

                    const req = FigshareApi.uploadFilePart(articleId, fileInfo, part);

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

            logger.debug(`completing figshare file upload (submission=${submission.id}, articleId=${articleId})`);
            return FigshareApi.completeFileUpload(articleId, fileInfo);

        }).finally(() => {

            fs.unlink(archiveFilePath, (err) => {
                if(err) {
                    logger.warn(`error deleting temporary archive file (submission=${submission.id}, articleId=${articleId}, tempArchivePath='${archiveFilePath}', error='${err.toString()}')`);
                }
                logger.debug(`deleted temporary archive file (submission=${submission.id}, articleId=${articleId}, tempArchivePath='${archiveFilePath}')`);
            });

        });
    });
}


async function _createTemporaryDirectory(manuscriptId) {

    return new Promise((resolve, reject) => {
        fs.mkdtemp(path.join(os.tmpdir(), `${manuscriptId}-`), (err, folder) => {
            if (err) {
                return reject(err);
            }
            return resolve(folder);
        });
    });
}



module.exports = uploadPMRArchiveToFigshare;