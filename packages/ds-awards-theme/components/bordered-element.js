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

const IssueBorder = css`
    border-color: #d00e00;
    box-shadow: 1px 1px 2px 2px #d00e0024;
`;



const BorderedElement = (Element) => styled(({className, issue, ...rest}) => <Element className={className} {...rest} /> )`
    ${BorderStyle}
    ${props => props.issue ? IssueBorder : ''}
`;

const SmallBorderedElement = (Element) => styled(({className, issue, ...rest}) => <Element className={className} {...rest} /> )`
    ${SmallBorderStyle}
    ${props => props.issue ? IssueBorder : ''}
`;


export default BorderedElement;
export { BorderedElement, SmallBorderedElement, BorderStyle, SmallBorderStyle };



