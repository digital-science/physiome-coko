import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import styled from 'styled-components';

import useCreateFileUploadSignedUrlMutation from './../../mutations/createFileUploadSignedUrl';
import useConfirmUploadedFileMutation from './../../mutations/confirmUploadedFile';
import useSetInstanceAssociatedFilesMutation from './../../mutations/setInstanceAssociatedFiles';
import withFormField, { fetchFields } from './withFormField';

import FileUploader from 'ds-awards-theme/components/file-uploader';
import FileListing from 'ds-awards-theme/components/file-listing';
import Label from 'ds-awards-theme/components/label';


const FileUploaderHolder = styled.div`
    margin-top: 15px;
    margin-bottom: 15px;
    
    > div.inner-holder {
        border: 1px solid #d0d0d0;
        border-radius: 5px;
        padding: 5px;
    }
`;


function FormFieldFileUploader({ data, binding, instanceId, instanceType, options = {} }) {

    const setInstanceAssociatedFiles = useSetInstanceAssociatedFilesMutation(instanceType, binding);
    const createFileUploadSignedUrl = useCreateFileUploadSignedUrlMutation();
    const confirmFileUpload = useConfirmUploadedFileMutation();
    const [fileListing, setFileListing] = useState([]);
    const [filesModified, setFilesModified] = useState(false);

    const formDataWasChanged = function _formDataWasChanged(form, field, v) {
        setFileListing(form.getFieldValue(field) || []);
    };

    useEffect(() => {

        if(!data || !binding) {
            return;
        }

        data.on(`field.${binding}`, formDataWasChanged);
        setFileListing(data.getFieldValue(binding) || []);
        setFilesModified(false);

        return function cleanup() {
            data.off(`field.${binding}`, formDataWasChanged);
        };

    }, [data, binding]);

    const { fileLabels, fileTypes } = options;
    const fileTypeOptions = useMemo(() => {

        if(!fileTypes) {
            return null;
        }

        const mapping = fileTypes.internalValueMapping;

        return Object.keys(mapping).map(k => {
            return {value:k, display:mapping[k]};
        });

    }, [fileTypes]);


    useEffect(() => {

        if(!data || filesModified !== true) {
            return;
        }

        const regId = data.registerRelationshipModifier(function(instanceId, instanceType, formData) {
            console.log("registered relationship modifier for binding called: " + binding);
            return updateAssociatedFilesWithInstance(instanceId, fileListing);
        });

        return () => {
            data.unregisterRelationshipModifier(regId);
        };

    }, [data, filesModified, fileListing]);


    function getSignedUrl(file, callback) {

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
    }

    function updateAssociatedFilesWithInstance(instanceId, files) {

        const associatedFiles = files.map(file => {

            const f = {id: file.id};

            if(fileLabels || fileTypes) {
                f.metaData = {type:null, label:null};

                if(fileTypes) {
                    f.metaData.type = file.type;
                }

                if(fileLabels) {
                    f.metaData.label = file.label;
                }
            }

            return f;
        });

        return setInstanceAssociatedFiles(instanceId, associatedFiles);
    }

    function finishedFileUpload(result) {

        console.log("Finish file upload !!!");
        console.dir(result);

        const confirmFileUploadInput = {
            fileId: result.fileId,
            signedUrl: result.signedUrl,
            signature: result.signature,
            fileByteSize: result.fileSize
        };

        return confirmFileUpload(confirmFileUploadInput).then(result => {

            if(!result) {
                return;
            }

            const newFiles = fileListing ? fileListing.slice(0) : [];
            newFiles.push(result);

            setFileListing(newFiles);
            return updateAssociatedFilesWithInstance(instanceId, newFiles);
        });
    }


    function fileWasModified(file) {
        setFilesModified(true);
        data.relationshipWasModified(binding);
    }

    function removeFile(file) {

        // FIXME: the file should be updated so it is considered removed from the owning data set, this could also be a special GraphQL mutation which accomplishes the same thing

        console.log("Remove file !!!");
        console.dir(file);

        fileWasModified(file);
    }

    function changeFileType(file, newType) {
        file.type = newType;
        fileWasModified(file);
        return newType;
    }

    function changeFileLabel(file, newLabel) {
        file.label = newLabel;
        fileWasModified(file);
        return newLabel;
    }

    const upload = {
        getSignedUrl: getSignedUrl,
        uploadRequestHeaders:{}
    };

    // FIXME: hard-coded value below for S3 bucket source
    return (
        <FileUploaderHolder className={"form-field-files"}>
            {options.label ? <Label>{options.label}</Label> : null}

            <div className="inner-holder">
                <FileUploader
                    s3Url={'https://ds-innovation-workflow-dev.s3.eu-west-2.amazonaws.com/'}
                    isImage={filename => { return false; }}
                    upload={upload}
                    onFinish={finishedFileUpload}
                    message={options.message}
                >
                </FileUploader>

                {fileListing && fileListing.length ?
                    <FileListing files={fileListing} instanceId={instanceId} instanceType={instanceType}
                        changeFileType={changeFileType} changeFileLabel={changeFileLabel} removeFile={removeFile}
                        fileLabels={fileLabels} fileTypeOptions={fileTypeOptions} /> : null}
            </div>
        </FileUploaderHolder>
    );
}



export default withFormField(FormFieldFileUploader, (element) => {

    // From the GraphQL endpoint we want to fetch the file set along with the associated name, size, type etc.
    // The top level field that we are interested in (that comes in via the 'data' data set is the binding values).

    const {binding:topLevel, options = {}} = element;
    const { fileLabels, fileTypes } = options;

    const fields = ['id', 'fileName', 'fileDisplayName', 'fileMimeType', 'fileByteSize'];
    if(fileLabels) {
        fields.push('label');
    }

    if(fileTypes) {
        fields.push('type');
    }

    const fetch = fetchFields(element.binding, fields.join(', '));
    return {topLevel, fetch};
});