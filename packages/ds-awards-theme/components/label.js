import React from 'react';
import styled from 'styled-components';


const Label = ({children=null, ...rest}) => {
    return <label {...rest}>{children}</label>
};

export default styled(Label)`
    font-family: ProximaNovaLight, sans-serif;
    font-size: 16px;
    color: #9c9c9c;
`;

const BlockLabel = styled(Label)`
    display: block;
    font-family: ProximaNovaLight, sans-serif;
    font-size: 16px;
    color: #9c9c9c;
`;

export { BlockLabel };