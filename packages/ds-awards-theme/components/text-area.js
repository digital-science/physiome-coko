import React from 'react';
import styled from 'styled-components';
import BorderedElement from './bordered-element'
import { th } from '../src/index';


const _TextArea = ({children=null, ...rest}) => {
    return <textarea{...rest}>{children}</textarea>
};

const TextArea = BorderedElement(_TextArea);

export default styled(TextArea)`
    width: 100%;
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
