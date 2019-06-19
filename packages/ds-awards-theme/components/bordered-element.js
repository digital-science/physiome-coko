import React from 'react';
import styled, {css} from 'styled-components';
import { th } from '../src/index';

const BorderStyle = css`    
    padding: ${th('borderedElement.default.padding')};
    border-radius: ${th('borderedElement.default.borderRadius')};
    border: ${th('borderedElement.default.borderWidth')} ${th('borderedElement.default.borderStyle')} ${th('borderedElement.default.borderColor')};
`;

const SmallBorderStyle = css`
    padding: ${th('borderedElement.small.padding')};
    border-radius: ${th('borderedElement.small.borderRadius')};
    border: ${th('borderedElement.small.borderWidth')} ${th('borderedElement.small.borderStyle')} ${th('borderedElement.small.borderColor')};
`;


const BorderedElement = (element) => styled(element)`${BorderStyle}`;
const SmallBorderedElement = (element) => styled(element)`${SmallBorderStyle}`;

export default BorderedElement;
export { BorderedElement, SmallBorderedElement, BorderStyle, SmallBorderStyle };



