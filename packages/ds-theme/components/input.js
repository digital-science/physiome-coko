import React from 'react';
import styled, { css } from 'styled-components';
import { th } from '../src/index';


const InputBaseStyle = css`
  font-family: ${th('input.fontFamily')};
  color: ${th('input.textColor')};
`;


const _Input = ({children=null, ...rest}) => {
    return <input {...rest}>{children}</input>
};

const Input = styled(_Input)`
    ${InputBaseStyle};
    font-size: ${th('input.default.fontSize')};
`;

const SmallInput = styled(_Input)`
    ${InputBaseStyle};
    font-size: ${th('input.small.fontSize')};
`;

export default Input;
export { Input, SmallInput };