import React from 'react';
import { Input, SmallInput } from './input';
import { BorderedElement, SmallBorderedElement } from './bordered-element'

const BorderedInput = BorderedElement(Input);
const SmallBorderedInput = SmallBorderedElement(SmallInput);

export default BorderedElement(Input);
export { BorderedInput, SmallBorderedInput };




