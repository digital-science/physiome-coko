import React from 'react';
import styled, { css } from 'styled-components';
import { BorderedInput, SmallBorderedInput } from './bordered-input';
import { th } from '../src/index';

const TextInputStyle = css`
    width: 100%;
    box-sizing: border-box;
`;

const TextInput = styled(BorderedInput)`
  ${TextInputStyle};
  font-size: ${th('textInput.default.fontSize')};
`;


const SmallTextInput = styled(SmallBorderedInput)`
  ${TextInputStyle};
  font-size: ${th('textInput.small.fontSize')};
`;

export default TextInput;
export { TextInput, SmallTextInput };