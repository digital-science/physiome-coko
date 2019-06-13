import React from 'react';
import styled from 'styled-components';


const _Select = ({options, ...rest}) => {
    return (
        <select{...rest}>
            {options.map((v, i) => <option key={i} value={v.value}>{v.display}</option> )}
        </select>
    );
};

export default styled(_Select)`
    width: 100%;
    font-family: ProximaNovaLight, sans-serif;
    font-size: 16px;
    color: black;
    box-sizing: border-box;
`;
