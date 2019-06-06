import React from 'react';
import styled from 'styled-components';

import { FaFilePdf, FaTimes } from 'react-icons/fa';
import humanFormatByteCount from "../helpers/humanFormatByteCount";


function _FileDownloadLink({ className, file, children }) {

    // FIXME: need to generate proper download links for files from the GraphQL endpoint
    // return <a href={generateDownloadLinkForSubmissionFile(submission, file)} target="_blank" rel="noopener noreferrer">{children}</a>;
    return <a className={className} href={""} target="_blank" rel="noopener noreferrer">{children}</a>;
}

const FileDownloadLink = styled(_FileDownloadLink)`
    color: initial;
    text-decoration: none;

    &:visited {
        color: initial;
    }
`;


function _FileUploadFileListing({ className, files, removeFile, linkForFile, fileDownloadLinkComponent }) {

    const DownloadLink = fileDownloadLinkComponent || FileDownloadLink;

    const listing = (files || []).map((file, index) =>
        <li key={file.id}>
            <div className="file-index">{index + 1}</div>
            <div className="file-icon"><FaFilePdf /></div>
            <div className="file-name">
                <DownloadLink file={file} linkForFile={linkForFile}>
                    {file.fileDisplayName}
                </DownloadLink>
                <span className="file-size">{humanFormatByteCount(file.fileByteSize)}</span>
            </div>
            {removeFile ? <div className="file-remove"><FaTimes onClick={() => { return removeFile(file); }} /></div> : null}
        </li>
    );

    return (
        <div className={`${className || ''} ${listing ? 'has-listing' : ''}`}>
            <ol style={{listStyle:"none", padding:0}}>{listing}</ol>
        </div>
    );
}

export default styled(_FileUploadFileListing)`

    font-family: ProximaNovaLight, sans-serif;
    font-size: 15px;

    ol {
        list-style: none;
        padding: 0;
        margin: 0;
    }
    
     li {
        padding: 5px 2px;
        height: 2em;
        display: flex;
        flex-direction: row;
        background: #f1f1f1;
    }
    
    li svg {
        height: 100%;
    }
    
    .file-index {
        background: #a0a0a0;
        text-align: center;
        line-height: 2.222em;
        margin-right: 10px;
        margin-left: 8px;
        color: white;
        font-size: 0.9em;
        flex-basis: 30px;
    }
    
    .file-name {
        margin-left: 5px;
        margin-right: 5px;
        line-height: 2em;
        flex: auto;
        text-decoration: none;
    }
    
    .file-size {
        color: #6d6d6d;
        font-size: 0.9em;
        line-height: 2em;
    }
    
    .file-size:before {
        content: " ("
    }
    .file-size:after {
        content: ")"
    }
    
    
    .file-remove {
        display: inline-block;
        margin-right: 10px;
        color: darkgrey;
        cursor: pointer;
    }
    
    .file-remove:hover {
        color: black;
    }
    
    &.has-listing {
        margin-top: 15px;
    }
`;