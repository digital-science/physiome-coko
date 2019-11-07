import React, { useRef, useLayoutEffect } from 'react';
import styled, { css } from 'styled-components';
import BorderedElement from './bordered-element'
import { th } from '../src/index';


const _TextArea = ({children=null, issue, autoSizeHeight = false, ...rest}) => {

    if(autoSizeHeight) {
        const elementRef = useRef();
        const handleKeyDown = (e) => {
            e.target.style.height = `0px`;
            e.target.style.height = `${e.target.scrollHeight}px`;
        };

        useLayoutEffect(() => {
            if(elementRef.current) {
                elementRef.current.style.height = `0px`;
                elementRef.current.style.height = `${elementRef.current.scrollHeight}px`;
            }
        });

        return (
            <textarea ref={elementRef} onKeyDown={handleKeyDown} {...rest}>{children}</textarea>
        );
    }

    return <textarea{...rest}>{children}</textarea>
};

const TextArea = BorderedElement(_TextArea);


export default styled(TextArea)`
    width: 100%;
    min-width: 100%;
    max-width: 100%;
    
    font-family: ${th('textArea.fontFamily')};
    font-size: ${th('textArea.fontSize')};
    color: ${th('textArea.textColor')};
    box-sizing: border-box;
    
    &:focus {
        box-shadow: 0 0 2px 2px #2196F3;
        border-color: #2196F3;
        outline: 0;
    }
`;
