import React from 'react';
import styled from 'styled-components';
import { th } from '../src/index';

const _Select = ({className, options, value, placeholder, issue, ...rest}) => {
    return (
        <select className={`${className} ${placeholder && !value ? 'placeholder-showing' : ''} ${issue ? 'issue' : ''}`} value={value} {...rest}>
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
    
    &:focus {
        box-shadow: 0 0 2px 2px #2196F3;
        border-color: #2196F3;
        outline: 0;
    }
    
    &.issue {
        border-color: #d10d00;
        color: ${th('validationIssue.textColor')};
        background: ${th('validationIssue.background')};
    }
`;

const _SizeSmall = (tag) => styled(tag)`
    font-size: ${th('input.small.fontSize')};
`;

const SmallSelect = _SizeSmall(Select);

export default Select;

export { Select, SmallSelect };
