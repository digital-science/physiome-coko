import React from 'react';
import styled from 'styled-components';
import { th } from '../src/index';

const _Select = ({className, options, value, placeholder, ...rest}) => {
    return (
        <select className={`${className} ${placeholder && !value ? 'placeholder-showing' : ''}`} value={value} {...rest}>
            {placeholder ? <option value={""} disabled>{placeholder}</option> : null}
            {options.map((v, i) => <option key={i} value={v.value}>{v.display}</option> )}
        </select>
    );
};

const Select = styled(_Select)`
    width: 100%;
    font-family: ${th('input.fontFamily')};
    font-size: ${th('input.default.fontSize')};
    color: ${th('input.textColor')};
    box-sizing: border-box;
    
    &.placeholder-showing {
        color: darkgrey;
    }
    
`;

const _SizeSmall = (tag) => styled(tag)`
    font-size: ${th('input.small.fontSize')};
`;

const SmallSelect = _SizeSmall(Select);

export default Select;

export { Select, SmallSelect };
