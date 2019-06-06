import React from 'react';
import styled from 'styled-components';


const _StaticText = ({children=null, ...rest}) => {
    return <span{...rest}>{children}</span>
};

export default styled(_StaticText)`
    font-family: ProximaNovaLight, sans-serif;
    font-size: 14px;
    color: black;
    box-sizing: border-box;
    word-break: break-word;
`;
