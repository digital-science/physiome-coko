import React from 'react';
import styled from 'styled-components';
import { th } from '../src/index';


const _Label = ({children=null, ...rest}) => {
    return <label {...rest}>{children}</label>
};

const Label = styled(_Label)`
    font-family: ${th("label.fontFamily")};
    font-size: ${th("label.default.fontSize")};
    color: ${th("label.textColor")};
`;

const BlockLabel = styled(Label)`
    display: block;
`;

const SmallLabel = styled(Label)`
    font-size: ${th("label.small.fontSize")};
`;

const SmallBlockLabel = styled(SmallLabel)`
    display: block;
`;


export default Label;
export { BlockLabel, SmallLabel, SmallBlockLabel };