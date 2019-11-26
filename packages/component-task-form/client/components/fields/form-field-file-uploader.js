import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import styled from 'styled-components';

import useCreateFileUploadSignedUrlMutation from './../../mutations/createFileUploadSignedUrl';
import useConfirmUploadedFileMutation from './../../mutations/confirmUploadedFile';
import useSetInstanceAssociatedFilesMutation from './../../mutations/setInstanceAssociatedFiles';
import useFormValidation, {formFieldClassNameWithValidations} from "../../hooks/useFormValidation";
import useFormBlockingProcess from '../../hooks/useFormBlockingProcess';
import withFormField, { fetchFields } from './withFormField';

import FileUploader from 'ds-theme/components/file-uploader';
import FileListing from 'ds-theme/components/file-listing';
import Label from 'ds-theme/components/label';
import ValidationIssueListing from 'ds-theme/components/validation-issue-listing';
import config from 'config';
import {NoteStaticText} from "ds-theme/components/static-text";


const BaseUrl = config['pubsweet-client'] ? (config['pubsweet-client'].baseUrl || "/") : "/";


const FileUploaderHolder = styled.div`
    margin-top: 15px;
    margin-bottom: 15px;
    
    > div.inner-holder {
        border: 1px solid #d0d0d0;
        border-radius: 5px;
        padding: 5px;
    }
    
    > div.issues {
      box-shadow: inset 0 0 4px #d10f008c;
      border-color: #d10f00;
    }
    
    > div.issues ${FileUploader} {
      background: linear-gradient(180deg,rgba(255,255,255,1) 0%,#d10f002e 100%);
      border-color: #d10f004a !important;
    }
    
    & ${NoteStaticText} {
      display: block;
      margin-top: 10px;
    }
`;


function FormFieldFileUploader({ className, data, binding, instanceId, instanceType, description, formDefinition, formValidator, options = {} }) {

    const setInstanceAssociatedFiles = useSetInstanceAssociatedFilesMutation(instanceType, binding);
    const createFileUploadSignedUrl = useCreateFileUploadSignedUrlMutation();
    const confirmFileUpload = useConfirmUploadedFileMutation();
    const [fileListing, setFileListing] = useState([]);
    const [filesModified, setFilesModified] = useState(false);
    const [validationIssues, clearValidationIssues] = useFormValidation(description, formDefinition, formValidator);
    const [_, incrementBlockingProcesses, decrementBlockingProcesses] = useFormBlockingProcess(formValidator, 'A file is currently in the process of being uploaded to the submission system.');

    useEffect(() => {

        if(!data || !binding) {
            return;
        }

        const formDataWasChanged = function _formDataWasChanged(form, field, v) {
            setFileListing(form.getFieldValue(field) || []);
        };

        data.on(`field.${binding}`, formDataWasChanged);

        const fileList = data.getFieldValue(binding) || [];
        fileList.sort((a, b) => a.order - b.order);

        setFileListing(fileList);
        setFilesModified(false);

        return function cleanup() {
            data.off(`field.${binding}`, formDataWasChanged);
        };

    }, [data, binding, setFileListing, setFilesModified]);

    const { fileLabels, fileTypes, help, accept = null } = options;
    const fileTypeOptions = useMemo(() => {

        if(!fileTypes) {
            return null;
        }

        const mapping = fileTypes.internalValueMapping;

        return Object.keys(mapping).map(k => {
            return {value:k, display:mapping[k]};
        });

    }, [fileTypes]);


    const updateAssociatedFilesWithInstance = useCallback((instanceId, files) => {

        const associatedFiles = files.map(file => {

            const f = {id: file.id};

            f.metaData = {removed:(file.removed === true)};

            if(fileLabels || fileTypes) {
                f.metaData.type = fileTypes ? file.type : null;
                f.metaData.label = fileLabels ? file.label : null;
            }

            return f;
        });

        return setInstanceAssociatedFiles(instanceId, associatedFiles);

    }, [setInstanceAssociatedFiles]);

    useEffect(() => {

        if(!data || filesModified !== true) {
            return;
        }

        const regId = data.registerRelationshipModifier(function(instanceId, instanceType, formData) {
            return updateAssociatedFilesWithInstance(instanceId, fileListing);
        });

        return () => {
            data.unregisterRelationshipModifier(regId);
        };

    }, [data, filesModified, fileListing, updateAssociatedFilesWithInstance]);


    const getSignedUrl = useCallback((file, callback) => {

        const signature = {
            ownerType: instanceType.name,
            ownerId: instanceId,
            fileName: file.name,
            mimeType: file.type
        };

        const createFileUploadInput = {signature};
        const fileSize = file.size;

        return createFileUploadSignedUrl(createFileUploadInput).then(result => {

            return callback({signedUrl:result.signedUrl, fileId:result.fileId, signature, fileSize});
        });
    }, [createFileUploadSignedUrl]);

    const setFieldListingUpdatingFormData = useCallback((files) => {
        data.setFieldValueForComplexObject(binding, files);
        setFileListing(files);
    }, [data, binding, setFileListing]);


    const onFilePreprocess = useCallback((file, next) => {
        incrementBlockingProcesses();
        return next(file);
    }, [incrementBlockingProcesses]);

    const onFileUploadError = useCallback((err, file) => {
        decrementBlockingProcesses();
    }, [decrementBlockingProcesses]);

    const finishedFileUpload = useCallback((result) => {

        const confirmFileUploadInput = {
            fileId: result.fileId,
            signedUrl: result.signedUrl,
            signature: result.signature,
            fileByteSize: result.fileSize
        };

        return confirmFileUpload(confirmFileUploadInput).then(result => {

            decrementBlockingProcesses();

            if(!result) {
                return;
            }

            const newFiles = fileListing ? fileListing.slice(0) : [];
            result.order = newFiles.length;
            newFiles.push(result);

            setFilesModified(true);
            setFieldListingUpdatingFormData(newFiles);
            data.relationshipWasModified(binding);
            clearValidationIssues();
        });

    }, [confirmFileUpload, fileListing, setFilesModified, setFieldListingUpdatingFormData,
        data, binding, clearValidationIssues, decrementBlockingProcesses
    ]);


    const fileWasModified = useCallback((file) => {
        setFilesModified(true);
        clearValidationIssues();
        data.relationshipWasModified(binding);
    }, [setFilesModified, clearValidationIssues, data, binding]);

    const removeFile = useCallback((file) => {
        file.removed = true;
        fileWasModified(file);
    }, [fileWasModified]);

    const changeFileType = useCallback((file, newType) => {
        file.type = newType;
        fileWasModified(file);
        return newType;
    }, [fileWasModified]);

    const changeFileLabel = useCallback((file, newLabel) => {
        file.label = newLabel;
        fileWasModified(file);
        return newLabel;
    }, [fileWasModified]);

    const reorderFile = useCallback((file, newIndex, oldIndex) => {

        const newFileListing = [...fileListing.filter(f => !f.removed), ...fileListing.filter(f => f.removed)];
        const [movedFile] = newFileListing.splice(oldIndex, 1);

        newFileListing.splice(newIndex, 0, movedFile);
        newFileListing.forEach((f, index) => f.order = index);

        setFieldListingUpdatingFormData(newFileListing);
        fileWasModified(movedFile);

    }, [fileListing, fileWasModified, setFieldListingUpdatingFormData]);

    const linkForFile = useCallback((file) => {
        return `${BaseUrl}/files/download/${instanceType.urlName}/${encodeURI(instanceId)}/${encodeURI(file.id)}/${encodeURI(file.fileName)}`;
    }, [instanceId, instanceType]);


    const upload = useMemo(() => {
        const u = {
            preprocess: onFilePreprocess,
            getSignedUrl: getSignedUrl,
            uploadRequestHeaders:{}
        };
        if(accept) {
            u.accept = accept;
        }
        return u;
    }, [getSignedUrl, onFilePreprocess, accept]);


    const filteredFileListing = (fileListing && fileListing.length) ? fileListing.filter(f => !f.removed) : null;

    return (
        <FileUploaderHolder className={formFieldClassNameWithValidations(className, validationIssues, "form-field-files")}>
            {options.label ? <Label>{options.label}</Label> : null}

            <div className={`inner-holder ${validationIssues && validationIssues.length ? 'issues' : ''}`}>
                <FileUploader
                    s3Url={''}
                    isImage={filename => { return false; }}
                    upload={upload}
                    onError={onFileUploadError}
                    onFinish={finishedFileUpload}
                    message={options.message}
                    accept={accept}
                >
                </FileUploader>

                {filteredFileListing && filteredFileListing.length ?
                    <FileListing files={filteredFileListing} linkForFile={linkForFile} instanceId={instanceId} instanceType={instanceType}
                        changeFileType={changeFileType} changeFileLabel={changeFileLabel} reorderFile={reorderFile}
                        warnOnFileRemove={true} removeFile={removeFile}
                        fileLabels={fileLabels} fileTypeOptions={fileTypeOptions} /> : null}
            </div>

            { validationIssues ? <ValidationIssueListing issues={validationIssues} /> : (help ? <NoteStaticText dangerouslySetInnerHTML={{__html: help}} /> : null) }

        </FileUploaderHolder>
    );
}



export default withFormField(FormFieldFileUploader, (element) => {

    // From the GraphQL endpoint we want to fetch the file set along with the associated name, size, type etc.
    // The top level field that we are interested in (that comes in via the 'data' data set is the binding values).

    const {binding:topLevel, options = {}} = element;
    const { fileLabels, fileTypes } = options;

    const fields = ['id', 'fileName', 'fileDisplayName', 'fileMimeType', 'fileByteSize', 'order', 'removed'];
    if(fileLabels) {
        fields.push('label');
    }

    if(fileTypes) {
        fields.push('type');
    }

    const fetch = fetchFields(element.binding, fields.join(', '));
    return {topLevel, fetch};
});