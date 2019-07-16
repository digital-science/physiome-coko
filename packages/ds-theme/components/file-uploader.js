import React, { Fragment, useLayoutEffect, useRef, useCallback, useState, useMemo } from 'react';
import styled from 'styled-components';

import mimeTypeToIcon from "../helpers/mimeTypeToIcon";
import humanFormatByteCount from "../helpers/humanFormatByteCount";

import { FaUpload } from 'react-icons/fa';

import DropzoneS3Uploader from 'react-dropzone-s3-uploader';


function _FileUploadGreeting({className, message}) {
    const finalClassName = `${className || ''} greeting`;
    return (
        <div className={finalClassName}>
            <FaUpload />
            {message || <Fragment>drop files <b>here</b> or <b>choose file</b></Fragment>}
        </div>);
}
const FileUploadGreeting = styled(_FileUploadGreeting)`

    font-family: ProximaNovaLight, sans-serif;
    padding: 10px;
    text-align: center;
    font-size: 15px;
    line-height: 40px;
    
    b {
        font-family: ProximaNovaLight, sans-serif;
    }
    
    svg {
        margin-right: 4px;
    }
`;

const FileUploadProgressMessage = styled.div`
 & svg {
   margin-bottom: -3px;
   padding-right: 2px;
 }
`;


function _FileUploadProgress({className, progress, file, ...rest}) {

    if(progress === null || progress === undefined) {
        return <div className={className || ''} />;
    }

    const FileIcon = useMemo(() => file && file.type ? mimeTypeToIcon(file.type) : null, [file]);

    const fileUploadMessage = file ?
        <FileUploadProgressMessage><div>Uploading file - {FileIcon ? <FileIcon/> : null}{file.name} ({humanFormatByteCount(file.size)})</div></FileUploadProgressMessage>
        : <FileUploadProgressMessage><div>Uploading file…</div></FileUploadProgressMessage>;

    return (
        <div className={`${className || ''} progress-holder`}>
            {fileUploadMessage}
            <div className={"progress"} style={{flexBasis: `${progress}%`}} />
        </div>
    );
}

const FileUploadProgress = styled(_FileUploadProgress)`

    position: absolute;
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;
    display: flex;
    
    > ${FileUploadProgressMessage} {
        position: absolute;
        left: 0;
        right: 0;
        top: 0;
        bottom: 0;
        z-index: 1;
        background: white;
        
        font-family: ProximaNovaLight, sans-serif;
        
        display: flex;
        align-items: center;
        justify-content: center;
    }

    > div.progress {
      background: rgba(130, 255, 81, 0.48);
      border-radius: 5px;
      box-shadow: inset 0 0 5px 1px #4caf5054;
      z-index: 3;
    }
`;



function _FileUploadError({className, error}) {
    return (error) ? <div className={`${className || ''} error`}>{error}</div> : <div className={className || ''} />;
}

const FileUploadError = styled(_FileUploadError)`
    
`;




const _FileUploader = ({className, greetingComponent, progressComponent, errorComponent, message, progress, error, children, onProgress, ...props}) => {

    const dropzoneRef = useRef(null);
    const [focused, setFocused] = useState(false);
    const [file, setFile] = useState(null);

    const onInputFocus = useCallback(() => {
        setFocused(true);
    }, [setFocused]);

    const onInputBlur = useCallback(() => {
        setFocused(false);
    }, [setFocused]);

    useLayoutEffect(() => {

        if(!dropzoneRef.current || !dropzoneRef.current._dropzone || !dropzoneRef.current._dropzone.fileInputEl) {
            return;
        }

        const input = dropzoneRef.current._dropzone.fileInputEl;
        const inputOnFocus = input.onfocus;
        const inputOnBlur = input.onblur;

        input.onfocus = function onfocus(...args) {
            onInputFocus();
            if(inputOnFocus) {
                inputOnFocus.call(this, ...args);
            }
        };

        input.onblur = function onfocus(...args) {
            onInputBlur();
            if(inputOnBlur) {
                inputOnBlur.call(this, ...args);
            }
        };

        return () => {
            input.onfocus = inputOnFocus;
            input.onblur = inputOnBlur;
        };
    });

    const onFileUploadProgress = (progress, textState, file) => {
        if(progress !== null && progress !== undefined) {
            setFile(file);
        } else {
            setFile(null);
        }

        if(onProgress) {
            onProgress(progress, textState, file);
        }
    };

    if(children) {
        return (
            <DropzoneS3Uploader className={`${className || ''} ${focused ? 'focused' : ''}`} ref={dropzoneRef} onProgress={onFileUploadProgress} {...props}>
                {greetingComponent || <FileUploadGreeting message={message}/>}
                {progressComponent || <FileUploadProgress file={file} />}
                {errorComponent || <FileUploadError />}
                {children}
            </DropzoneS3Uploader>
        );
    }

    return (
        <DropzoneS3Uploader className={`${className || ''} ${focused ? 'focused' : ''}`} ref={dropzoneRef} onProgress={onFileUploadProgress} {...props}>
            {greetingComponent || <FileUploadGreeting message={message}/>}
            {progressComponent || <FileUploadProgress file={file} />}
            {errorComponent || <FileUploadError />}
        </DropzoneS3Uploader>
    );
};

const FileUploader = styled(_FileUploader)`
    box-sizing: border-box;

    width: 100% !important;
    height: 60px !important;
    
    background: rgb(255,255,255);
    background: linear-gradient(180deg, rgba(255,255,255,1) 0%, rgba(213,238,245,0.59) 100%);
    
    border: 2px dashed #cbcbcb7a !important;
    
    &.focused {
        box-shadow: 0 0 2px 2px #2196F3;
        border-color: #2196F3;
        outline: 0;
    }
`;


export default FileUploader;