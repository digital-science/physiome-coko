import React, { useState, useEffect } from 'react';
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

    const formDataWasChanged = function _formDataWasChanged(form, field, v) {
        setFileListing(form.getFieldValue(field) || []);
    };

    useEffect(() => {

        if(!data || !binding) {
            return;
        }

        data.on(`field.${binding}`, formDataWasChanged);
        setFileListing(data.getFieldValue(binding) || []);

        return function cleanup() {
            data.off(`field.${binding}`, formDataWasChanged);
        };

    }, [data, binding]);


    function getSignedUrl(file, callback) {

        console.dir(file);

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

            console.dir(result);

            if(!result) {
                return;
            }

            const newFiles = fileListing ? fileListing.slice(0) : [];
            newFiles.push(result);

            setFileListing(newFiles);

            return setInstanceAssociatedFiles(instanceId, newFiles.map(file => file.id)).then(result => {

                console.log("did set associated files");
                console.dir(result);
            })

            // Now need to save this as the set of files associated with the instance owner.
            // !!!!

        });

        /*const { file, fileID } = result;
        const finalFile = {};

        finalFile.id = fileID;
        finalFile.name = file.name;
        finalFile.type = file.type;
        finalFile.size = file.size;

        const files = value || [];
        files.push(finalFile);

        setModelValue(files);*/
    }

    function removeFile(file) {

        // FIXME: the file should be updated so it is considered removed from the owning data set, this could also be a special GraphQL mutation which accomplishes the same thing

        console.log("Remove file !!!");
        console.dir(file);

        /*if(file.id) {
            const newFiles = (value || []).filter(f => f.id !== file.id);
            setModelValue(newFiles);
            // NOTE: also delete file from server, or allow for a cleanup process to remove unlinked files??
        }*/
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

                {fileListing && fileListing.length ? <FileListing files={fileListing} instanceId={instanceId} instanceType={instanceType} removeFile={removeFile} /> : null}
            </div>
        </FileUploaderHolder>
    );
}



export default withFormField(FormFieldFileUploader, (element) => {

    // From the GraphQL endpoint we want to fetch the file set along with the associated name, size, type etc.
    // The top level field that we are interested in (that comes in via the 'data' data set is the binding values).

    const topLevel = element.binding;
    const fetch = fetchFields(element.binding, `id, fileName, fileDisplayName, fileMimeType, fileByteSize`);

    return {topLevel, fetch};
});