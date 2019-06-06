const { BaseModel } = require('component-model');
const config = require('config');
const AWS = require('aws-sdk');
const uuid = require('uuid/v5');
const _ = require('lodash');

const WorkflowFilesConfig = config.get('workflow-files');

const AWSCredentials = new AWS.Credentials(WorkflowFilesConfig.accessKeyId, WorkflowFilesConfig.secretAccessKey);
const S3 = new AWS.S3({
    region: WorkflowFilesConfig.region,
    credentials: AWSCredentials
});


const StorageTypeExternalS3 = "FileStorageExternalS3";


class File extends BaseModel {

    static get tableName() {
        return 'file';
    }

    static get schema() {
        return {
            type:'object',
            properties: {

                fileName: { type: ['string', 'null'] },
                fileDisplayName: { type: ['string', 'null'] },

                fileMimeType: { type: ['string', 'null'] },
                fileByteSize: { type: ['integer'] },

                storageKey: { type: ['string', 'null'] },
                storageType: { type: ['string', 'null'] },

                confirmed: { type: ['boolean', 'null'] }
            }
        };
    }

    s3Object(ownerType, ownerId, extraParams={}) {

        if(!this.storageKey) {
            return null;
        }

        if(this.storageType !== StorageTypeExternalS3) {
            return null;
        }

        const params = {...extraParams, ..._getParametersForFile(ownerType, ownerId, this.storageKey)};
        return S3.getObject(params);
    }
}

exports.model = exports.File = File;


exports.resolvers = {

    Query: {
        getFile: async function(_, {fileId}) {
            // FIXME: access control will be needed here to restrict file access etc.
            const file =  await File.find(fileId);
            if(!file) {
                return null;
            }

            const r = file.toJSON();
            //r.accessUrl = ``;
            // ---> /files/:owner_type/:owner_id/:file_id/:name ???? <---
            return file;
        }
    },

    Mutation: {

        createFileUploadSignedUrl: function(_, {input:{signature}}) {

            const {ownerType, ownerId, fileName, mimeType} = signature;

            return createSignedFileUpload(ownerType, ownerId, fileName, mimeType).then(result => {
                return {signedUrl:result.url, fileId:result.fileId, signature};
            });
        },

        confirmFileUpload: async function(_, {input:{signedUrl, fileId, signature, fileByteSize}}) {

            const {fileName, mimeType} = signature;
            const file = new File({
                created: new Date().toISOString(),
                updated: new Date().toISOString(),
                fileName,
                fileDisplayName:fileName,
                fileMimeType: mimeType,
                fileByteSize: fileByteSize,
                storageKey: fileId,
                storageType: StorageTypeExternalS3,
                confirmed: true
            });

            await file.save();
            return file;
        }
    }

};



function createSignedFileUpload(ownerType, ownerId, fileName, contentType) {

    return new Promise((resolve, reject) => {

        const fileId =  '' + uuid(WorkflowFilesConfig.fileIdentifierDomain || 'workflow-dev.ds-innovation-experiments.com', uuid.DNS) +  '-' + fileName.replace(/[^A-Za-z0-9.]/g, "");
        const fileKey = ownerType + '/' + ownerId + '/' + fileId;

        const params = {
            Bucket: WorkflowFilesConfig.bucket,
            Key: fileKey,
            Expires: WorkflowFilesConfig.signExpireTimeout || 3600,
            ContentType: contentType
        };

        S3.getSignedUrl('putObject', params, (err, url) => {
            if (err) {
                return reject(err);
            }
            return resolve({ url, fileId, ownerId, fileName, contentType });
        });
    });
}


function _getParametersForFile(ownerType, ownerID, fileID) {

    const fileKey = ownerType + '/' + ownerID + '/' + fileID.replace("/", "");
    return {
        Bucket: WorkflowFilesConfig.bucket,
        Key: fileKey
    };
}


function _forwardS3Object(s3Object, response, next) {

    s3Object.on('httpHeaders', function (code, headers) {
        if (code < 300) {
            response.set(_.pick(headers, 'content-type', 'content-length', 'last-modified'));
        }
    })
        .createReadStream()
        .on('error', next)
        .pipe(response);
}


function createProxyFileHandler(app) {

    app.get("/files/:owner_type/:owner_id/:file_id/:name", (request, response, next) => {

        const ownerType = request.params.owner_type;
        const ownerId = request.params.owner_id;
        const fileId = request.params.file_id;

        if(!ownerType || !ownerId || !fileId) {
            return response.status(400).send();
        }

        _forwardS3Object(_getParametersForFile(ownerType, ownerId, fileId), response, next);
    });
}

exports.serverSetup = function serverSetup(app) {
    return createProxyFileHandler(app);
};