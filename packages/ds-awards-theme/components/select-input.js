import React from 'react';
import styled from 'styled-components';


const _Select = ({options, ...rest}) => {
    return (
        <select{...rest}>
            {options.map((v, i) => <option key={i} value={v.value}>{v.display}</option> )}
        </select>
    );
};

const Select = styled(_Select)`
    width: 100%;
    font-family: ProximaNovaLight, sans-serif;
    font-size: 16px;
    color: black;
    box-sizing: border-box;
`;

const _SizeSmall = (tag) => {
    return styled(tag)`
  
  font-size:12px;
`;
};

const SmallSelect = _SizeSmall(Select);

export default Select;

export { SmallSelect };
