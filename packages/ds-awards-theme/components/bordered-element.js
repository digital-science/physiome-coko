import React from 'react';
import styled from 'styled-components';

const BorderStyle = `    
    padding: 12px;
    border-radius: 5px;
    border: 1px solid #d0d0d0;
`;

export default (element) => {

    return styled(element)`
    ${BorderStyle}
`;
};


const SmallBorderStyle = `
    padding: 6px;
    border-radius: 5px;
    border: 1px solid #d0d0d0;
`;


export { BorderStyle, SmallBorderStyle };



