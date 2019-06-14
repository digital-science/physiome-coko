import React from 'react';
import styled from 'styled-components';
import BorderedInput from './bordered-input';

const TextInput = styled(BorderedInput)`
    width: 100%;
    box-sizing: border-box;
`;

export default TextInput;

const SmallTextInput = styled(TextInput)`
  font-size: 12px;
  padding: 6px;
`;

export { SmallTextInput };