import React from 'react';
import styled from 'styled-components';


const Input = ({children=null, ...rest}) => {
    return <input {...rest}>{children}</input>
};

export default styled(Input)`
    font-family: ProximaNovaLight, sans-serif;
    font-size: 16px;
    color: black;
`;




