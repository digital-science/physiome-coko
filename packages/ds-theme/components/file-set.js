import React from 'react';
import styled from 'styled-components';

import humanFormatByteCount from "ds-theme/helpers/humanFormatByteCount";
import mimeTypeToIcon from "ds-theme/helpers/mimeTypeToIcon";

import { FaFile } from 'react-icons/fa';
import config from 'config';


const BaseUrl = config['pubsweet-client'] ? (config['pubsweet-client'].baseUrl || "/") : "/";

const FileSet = styled(({className, files, instanceId, instanceType}) => {

    if(!files || !files.length) {
        return null;
    }

    return (
        <ol className={className}>
            {files.map(file => {

                const FileIcon = mimeTypeToIcon(file.fileMimeType) || FaFile;
                return (
                    <li key={file.id}>
                        <a href={`${BaseUrl}/files/download/${instanceType.urlName}/${encodeURI(instanceId)}/${encodeURI(file.id)}/${encodeURI(file.fileName)}`}
                            target="_blank" rel="noopener noreferrer">

                            <FileIcon />
                            <span className="file-name">{file.fileDisplayName}</span>
                            <span className="file-size">{humanFormatByteCount(file.fileByteSize)}</span>
                        </a>
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
    
    > li > a {
      display: inline-block;
      /*padding: 5px 5px;
      background: aliceblue;
      border-radius: 5px;
      border: 1px dashed #9dcef8;*/
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
      color: #7d7d7d;
    }
    
    > li span.file-size:before {
      content: " (";
      color: #7d7d7d;
    }
    > li span.file-size:after {
      content: ")";
      color: #7d7d7d;
    }
`;

export default FileSet;