import React from 'react';
import styled from 'styled-components';


const _StaticText = ({children=null, ...rest}) => {
    return <span{...rest}>{children}</span>
};

const StaticText = styled(_StaticText)`
    font-family: ProximaNovaLight, sans-serif;
    font-size: 14px;
    color: black;
    box-sizing: border-box;
    word-break: break-word;
`;

const LargeStaticText = styled(StaticText)`
    font-size: 16px;
`;


export default StaticText;

const DisabledStaticText = styled(StaticText)`
    color: #b3b3b3;
`;

export { LargeStaticText, DisabledStaticText };