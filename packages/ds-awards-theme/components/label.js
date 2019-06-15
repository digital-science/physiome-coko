import React from 'react';
import styled from 'styled-components';


const _Label = ({children=null, ...rest}) => {
    return <label {...rest}>{children}</label>
};

const Label = styled(_Label)`
    font-family: ProximaNovaLight, sans-serif;
    font-size: 16px;
    color: #9c9c9c;
`;

export default Label;

const BlockLabel = styled(Label)`
    display: block;
`;

const SmallLabel = styled(Label)`
  font-size: 12px;
`;

const SmallBlockLabel = styled(SmallLabel)`
    display: block;
`;


export { BlockLabel, SmallLabel, SmallBlockLabel };