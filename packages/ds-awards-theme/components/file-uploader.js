import React, { Fragment, useLayoutEffect, useRef, useCallback, useState } from 'react';
import styled from 'styled-components';

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



function _FileUploadProgress({className, progress}) {

    if(progress === null || progress === undefined) {
        return <div className={className || ''} />;
    }
    return (
        <div className={`${className || ''} progress-holder`}>
            <div style={{flexBasis: `${progress}%`}} />
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

    > div {
        background: rgba(35,125,0,0.48);
        border-radius: 5px;
    }
`;



function _FileUploadError({className, error}) {
    return (error) ? <div className={`${className || ''} error`}>{error}</div> : <div className={className || ''} />;
}

const FileUploadError = styled(_FileUploadError)`
    
`;




const _FileUploader = ({className, greetingComponent, progressComponent, errorComponent, message, progress, error, children, ...props}) => {

    const dropzoneRef = useRef(null);
    const [focused, setFocused] = useState(false);

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

    if(children) {
        return (
            <DropzoneS3Uploader className={`${className || ''} ${focused ? 'focused' : ''}`} ref={dropzoneRef} {...props}>
                {greetingComponent || <FileUploadGreeting message={message}/>}
                {progressComponent || <FileUploadProgress />}
                {errorComponent || <FileUploadError />}
                {children}
            </DropzoneS3Uploader>
        );
    }

    return (
        <DropzoneS3Uploader className={`${className || ''} ${focused ? 'focused' : ''}`} ref={dropzoneRef} {...props}>
            {greetingComponent || <FileUploadGreeting message={message}/>}
            {progressComponent || <FileUploadProgress />}
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