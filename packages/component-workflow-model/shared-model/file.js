const { BaseModel } = require('component-model');
const { Identity } = require('./identity');

const AclRule = require('client-workflow-model/AclRule');
const AclActions = AclRule.Actions;

const { lookupInstanceByUrlMapping } = require('./../dsl-model/instance-registry');

const jwt = require('jsonwebtoken');
const AWS = require('aws-sdk');
const uuid = require('uuid/v5');
const _ = require('lodash');

const config = require('config');


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

    s3Object(ownerTypeModel, ownerId, extraParams={}) {

        if(!this.storageKey) {
            return null;
        }

        if(this.storageType !== StorageTypeExternalS3) {
            return null;
        }

        const params = {...extraParams, ..._getParametersForFile(ownerTypeModel, ownerId, this.storageKey)};
        return S3.getObject(params);
    }
}

exports.model = exports.File = File;


exports.resolvers = {

    Mutation: {

        createFileUploadSignedUrl: function(_, {input:{signature}}) {

            // FIXME: based on the owner type and owner id, we need to check that the current user is allowed to access the object
            // and also possibly the file collection this is going to be added to??
            // or do we check that the user has access to any file collection ???

            const {ownerType, ownerId, fileName, mimeType} = signature;

            return createSignedFileUpload(ownerType, ownerId, fileName, mimeType).then(result => {
                return {signedUrl:result.url, fileId:result.fileId, signature};
            });
        },

        confirmFileUpload: async function(_, {input:{signedUrl, fileId, signature, fileByteSize}}) {

            // FIXME: we need to double check the users access to the owning object (via signature) and then also ensure that the file is present within the S3 bucket

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

    const { models } = require('component-workflow-model/model');
    const ownerTypeModel = models[ownerType];
    if(!ownerTypeModel) {
        return Promise.reject(new Error("Object type not defined."));
    }

    if(!ownerTypeModel.fileStorageKey) {
        return Promise.reject(new Error("Object type does not define a file storage key."));
    }

    return new Promise((resolve, reject) => {

        const fileId =  '' + uuid(WorkflowFilesConfig.fileIdentifierDomain || 'workflow-dev.ds-innovation-experiments.com', uuid.DNS) +  '-' + fileName.replace(/[^A-Za-z0-9.]/g, "");
        const fileKey = ownerTypeModel.fileStorageKey + '/' + ownerId + '/' + fileId;

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


function _getParametersForFile(ownerTypeModel, ownerID, fileID) {

    if(!ownerTypeModel.fileStorageKey) {
        return null;
    }

    const fileKey = ownerTypeModel.fileStorageKey + '/' + ownerID + '/' + fileID.replace("/", "");
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


function _verifyFileToken(fileAccessToken) {

    return new Promise((resolve, reject) => {
        jwt.verify(fileAccessToken, config.get('pubsweet-server.secret'), (err, decoded) => {
            if (err) {
                return reject(err);
            }
            return resolve(decoded);
        });
    });
}


function clientDownloadFileHandler(app) {

    app.get("/files/download/:owner_type/:owner_id/:file_id/:name", (request, response, next) => {

        const fileAccessToken = request.cookies ? request.cookies["file_token"] : null;
        if(!fileAccessToken) {
            return response.status(200).send("Redirect for login");
        }

        _verifyFileToken(fileAccessToken).then(async decodedToken => {

            const { id:identityId, fileAccess } = decodedToken;
            if(!identityId || fileAccess !== true) {
                return response.status(200).send("Redirect for login");
            }

            const urlOwnerType = request.params.owner_type;
            const ownerId = request.params.owner_id;
            const fileId = request.params.file_id;

            if(!urlOwnerType || !ownerId || !fileId) {
                return response.status(400).send("Invalid parameters");
            }

            const ownerTypeModel = lookupInstanceByUrlMapping(urlOwnerType);
            if(!ownerTypeModel) {
                return response.status(400).send("Invalid parameters");
            }

            // Resolve the listing of fields associated with the model that are associated to files.
            const fileRelations = (ownerTypeModel.relationFields || []).filter(f => (f.type === "File" || f.type === "ExtendedFile"));
            if(!fileRelations.length) {
                return response.status(404).send("File not found");
            }

            const [object, user] = await Promise.all([
                ownerTypeModel.find(ownerId, fileRelations.map(f => f.field)),
                Identity.find(identityId),
            ]);

            if(!object) {
                return response.status(404).send("Owner of file not found");
            }

            if(!user) {
                return response.status(404).send("Identity not found");
            }


            let matchingFile = null;
            let matchingField = null;

            for(let i = 0; i < fileRelations.length; i++) {

                const f = fileRelations[i];
                const v = object[f.field];
                if(!v) {
                    continue;
                }

                ((v instanceof Array) ? v : [v]).forEach(file => {

                    if(!matchingFile && file.id === fileId) {
                        matchingFile = file;
                        matchingField = f;
                    }
                });

                if(matchingFile) {
                    break;
                }
            }

            if(!matchingFile) {
                return response.status(404).send("File not found");
            }

            // Check ACL access to the file in question. First we check that the user has access rights onto
            // the owning object, then we check to see if the user has read access onto the field which
            // stores the file.

            const aclSet = ownerTypeModel.aclSet;

            if(aclSet) {

                const [aclTargets, isOwner] = ownerTypeModel.userToAclTargets(user, object);

                const accessMatch = aclSet.applyRules(aclTargets, AclActions.Access, object);
                //debugAclMatching(user, aclTargets, isOwner, AclActions.Access, accessMatch);
                if(!accessMatch.allow) {
                    return response.status(403).send("File access not allowed");
                }

                const readMatch = aclSet.applyRules(aclTargets, AclActions.Read, object, 'server');
                //debugAclMatching(user, aclTargets, isOwner, AclActions.Read, readMatch);
                if(!readMatch.allow) {
                    return response.status(403).send("File read not allowed");
                }

                const allowedFields = object.allowedReadFieldsForReadAcl(readMatch, false);
                if(!allowedFields.hasOwnProperty(matchingField.field)) {
                    return response.status(403).send("File read not allowed");
                }
            }

            return _forwardS3Object(matchingFile.s3Object(ownerTypeModel, ownerId), response, next);
        });

    });

}

exports.serverSetup = function serverSetup(app) {
    return clientDownloadFileHandler(app);
};