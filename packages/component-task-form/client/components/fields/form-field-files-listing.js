import React from 'react';
import styled from 'styled-components';

import withFormField, { fetchFields } from './withFormField';
import withFormFieldData from './withFormFieldData';

import { BlockLabel } from 'ds-theme/components/label';
import { DisabledStaticText } from 'ds-theme/components/static-text';
import humanFormatByteCount from "ds-theme/helpers/humanFormatByteCount";
import mimeTypeToIcon from "ds-theme/helpers/mimeTypeToIcon";

import { FaFile, FaDownload } from 'react-icons/fa';
import config from 'config';


const BaseUrl = config['pubsweet-client'] ? (config['pubsweet-client'].baseUrl || "/") : "/";

const FileListingHolder = styled.div`    
    > div.inner-holder {
        border: 1px solid #d0d0d0;
        border-radius: 5px;
        padding: 5px;
    }
`;


const SimpleFileListing = styled(({className, files, instanceId, instanceType}) => {

    if(!files || !files.length) {
        return null;
    }


    return (
        <ol className={className}>
            {files.map(file => {

                const fileUrl = `${BaseUrl}/files/download/${instanceType.urlName}/${encodeURI(instanceId)}/${encodeURI(file.id)}/${encodeURI(file.fileName)}`;
                const FileIcon = mimeTypeToIcon(file.fileMimeType) || FaFile;

                return (
                    <li key={file.id}>
                        <div>
                            <a href={fileUrl} target="_blank" rel="noopener noreferrer">
                                <FileIcon />
                                <span className="file-name">{file.fileDisplayName}</span>
                                <span className="file-size">{humanFormatByteCount(file.fileByteSize)}</span>
                            </a>
                            <a className={'force-download'} href={fileUrl} target="_blank" rel="noopener noreferrer" download={file.fileName}><FaDownload /></a>
                        </div>
                    </li>
                )
            })}
        </ol>
    );

})`
  
    font-family: ProximaNovaLight, sans-serif;
    font-size: 15px;
    
    list-style: none;
    margin: 0;
    padding: 0;
    
    margin-top: 5px;
    
    > li {
        margin-bottom: 5px;
    }
    
    > li > div {
      display: inline-block;
      padding: 5px 5px;
      background: aliceblue;
      border-radius: 5px;
      border: 1px dashed #9dcef8;
    }
    
    > li > div a {
      color: initial;
      text-decoration: none;
    }
    
    > li svg {
      vertical-align: top;
    }
    
    > li span.file-name {
      margin-left: 4px;
    }
    
    > li span.file-size {
      color: #b3b3b3;
    }
    
    > li span.file-size:before {
      content: " (";
      color: #b3b3b3;
    }
    > li span.file-size:after {
      content: ")";
      color: #b3b3b3;
    }
    
    > li a.force-download {
      color: initial;
      text-decoration: none;
      margin-left: 5px;
    }
`;



function FormFieldFilesListing({ data, binding, instanceId, instanceType, options = {} }) {

    const [fileListing] = withFormFieldData(data, binding);
    const filteredFiles = fileListing ? fileListing.filter(f => f.removed !== true) : null;

    return (
        <FileListingHolder className={"form-field-files"}>
            {options.label ? <BlockLabel>{options.label}</BlockLabel> : null}
            {filteredFiles && filteredFiles.length
                ? <SimpleFileListing files={filteredFiles} instanceId={instanceId} instanceType={instanceType} />
                : <DisabledStaticText>No files uploaded.</DisabledStaticText>
            }
        </FileListingHolder>
    );
}


export default withFormField(FormFieldFilesListing, (element) => {

    // From the GraphQL endpoint we want to fetch the file set along with the associated name, size, type etc.
    // The top level field that we are interested in (that comes in via the 'data' data set is the binding values).

    const topLevel = element.binding;
    const fetch = fetchFields(element.binding, `id, fileName, fileDisplayName, fileMimeType, fileByteSize`);

    return {topLevel, fetch};
});