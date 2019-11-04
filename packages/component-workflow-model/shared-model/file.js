const { BaseModel } = require('component-model');
const { Identity } = require('./identity');

const AclRule = require('client-workflow-model/AclRule');
const AclActions = AclRule.Actions;

const { lookupInstanceByUrlMapping, lookupInstance } = require('./../dsl-model/instance-registry');
const { resolveUserForContext, userIdentityIdForContext } = require('../shared-helpers/access');

const { AuthorizationError, NotFoundError } = require('@pubsweet/errors');
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

                confirmed: { type: ['boolean', 'null'] },

                uploaderId: { type:['string', 'null'], format:'uuid'} }
        };
    }

    static get relationMappings() {

        return {
            uploader: {
                relation: BaseModel.BelongsToOneRelation,
                modelClass: Identity,
                join: {
                    from: `${this.tableName}.uploaderId`,
                    to: `${Identity.tableName}.id`
                }
            }
        };
    }

    // Required for relation resolution
    static get relationFieldNames() {
        return ['uploader'];
    }

    // Required for relation resolution
    static get belongsToOneRelationFields() {
        return [
            {
                field: {
                    field: 'uploader',
                    type: 'Identity',
                    joinField: 'uploaderId',
                    model: Identity
                },
                join: 'uploaderId'
            }
        ];
    }

    static get defaultEager () {
        return 'uploader';
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

        createFileUploadSignedUrl: async function(_, {input:{signature}}, context) {

            const {ownerType, ownerId, fileName, mimeType} = signature;
            if(!ownerType || !ownerId) {
                return new Error("Invalid file upload signature provided.");
            }

            const OwnerTypeModel = lookupInstance(ownerType);
            if(!OwnerTypeModel) {
                return new Error("Unknown model type in file signature.");
            }

            const fileRelations = _fileRelationsForOwnerModel(OwnerTypeModel);
            if(!fileRelations || !fileRelations.length) {
                return new Error("Object definition does not have associated files.");
            }

            const [object, user] = await Promise.all([
                OwnerTypeModel.find(ownerId),
                resolveUserForContext(context)
            ]);

            if(!object) {
                return new NotFoundError("Owning object for file not found.");
            }

            if(!user) {
                throw new AuthorizationError("Uploading files requires a valid current user.");
            }


            // For the model object, resolve the access the current user has for performing "writes".
            // For the matching acl rules, we filter the file relation fields against the allowed fields.
            // Users are only allowed to confirm a file if they can currently write to a file field.

            const { access, accessMatch } = object.checkUserAccess(user, AclActions.Write);
            if(!access) {
                throw new AuthorizationError("User not authorised to modify the files owning object.");
            }

            const { allowedFields = [] } = accessMatch;
            const filteredFileRelations = fileRelations.filter(r => allowedFields.indexOf(r.field) !== -1);

            if(!filteredFileRelations.length) {
                throw new AuthorizationError("No write access to file fields for specified object.");
            }


            return createSignedFileUpload(OwnerTypeModel, ownerId, fileName, mimeType).then(result => {
                return {signedUrl:result.url, fileId:result.fileId, signature};
            });
        },

        confirmFileUpload: async function(_, {input:{signedUrl, fileId, signature, fileByteSize}}, context) {

            const uploaderId = userIdentityIdForContext(context);
            const {ownerType, ownerId, fileName, mimeType} = signature;
            if(!ownerType || !ownerId) {
                return new Error("Invalid file upload signature provided.");
            }

            const OwnerTypeModel = lookupInstance(ownerType);
            if(!OwnerTypeModel) {
                return new Error("Unknown model type in file signature.");
            }

            const fileRelations = _fileRelationsForOwnerModel(OwnerTypeModel);
            if(!fileRelations || !fileRelations.length) {
                return new Error("Object definition does not have associated files.");
            }


            const [object, user] = await Promise.all([
                OwnerTypeModel.find(ownerId),
                resolveUserForContext(context)
            ]);

            if(!object) {
                return new NotFoundError("Owning object for file not found.");
            }

            if(!user) {
                throw new AuthorizationError("Uploading files requires a valid current user.");
            }


            // For the model object, resolve the access the current user has for performing "writes".
            // For the matching acl rules, we filter the file relation fields against the allowed fields.
            // Users are only allowed to confirm a file if they can currently write to a file field.

            const { access, accessMatch } = object.checkUserAccess(user, AclActions.Write);
            if(!access) {
                throw new AuthorizationError("User not authorised to modify the files owning object.");
            }

            const { allowedFields = [] } = accessMatch;
            const filteredFileRelations = fileRelations.filter(r => allowedFields.indexOf(r.field) !== -1);

            if(!filteredFileRelations.length) {
                throw new AuthorizationError("No write access to file fields for specified object.");
            }

            const currentDateTime = new Date().toISOString();
            const file = new File({
                created: currentDateTime,
                updated: currentDateTime,
                fileName,
                fileDisplayName:fileName,
                fileMimeType: mimeType,
                fileByteSize: fileByteSize,
                storageKey: fileId,
                storageType: StorageTypeExternalS3,
                confirmed: true,
                uploaderId: uploaderId
            });

            await file.save();
            return file;
        }
    }

};



function createSignedFileUpload(OwnerTypeModel, ownerId, fileName, contentType) {

    if(!OwnerTypeModel.fileStorageKey) {
        return Promise.reject(new Error("Object type does not define a file storage key."));
    }

    return new Promise((resolve, reject) => {

        const fileId =  '' + uuid(WorkflowFilesConfig.fileIdentifierDomain || 'workflow-dev.ds-innovation-experiments.com', uuid.DNS) +  '-' + fileName.replace(/[^A-Za-z0-9.]/g, "");
        const fileKey = OwnerTypeModel.fileStorageKey + '/' + ownerId + '/' + fileId;

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


function _fileRelationsForOwnerModel(ownerTypeModel) {

    return (ownerTypeModel.relationFields || []).filter(f => (f.type === "File" || f.type === "ExtendedFile"));
}




exports.serverSetup = function serverSetup(app) {
    return clientDownloadFileHandler(app);
};