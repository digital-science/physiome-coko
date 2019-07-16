import React from 'react';
import { Input, SmallInput } from './input';
import { BorderedElement, SmallBorderedElement } from './bordered-element';
import styled, { css } from 'styled-components';

const FocusStyle = (c) => {
    return styled(c)`
&:focus {
    box-shadow: 0 0 2px 2px #2196F3;
    border-color: #2196F3;
    outline: 0;
}

`
};

const BorderedInput = BorderedElement(FocusStyle(Input));
const SmallBorderedInput = SmallBorderedElement(FocusStyle(SmallInput));

export default BorderedInput;
export { BorderedInput, SmallBorderedInput };




