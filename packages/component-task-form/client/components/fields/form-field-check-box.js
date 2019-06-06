import React from 'react';
import styled from 'styled-components';

import useFormValueBinding from './../../hooks/useFormValueBinding';
import withFormField from './withFormField'

import Checkbox, { CheckboxLabel } from 'ds-awards-theme/components/checkbox-input';


const FormStyledCheckbox = styled(Checkbox)`
`;

function FormFieldCheckbox({data, binding, options = {}}) {

    const [value, _, handleInputChange] = useFormValueBinding(data, binding, "", (v) => v || "");
    const handleCheckedChange = options.readOnly === true ? null : handleInputChange;
    const input = <FormStyledCheckbox checked={value || false} disabled={options.readOnly || false} onChange={handleCheckedChange} />;

    return options.label ? (<CheckboxLabel>{input} {options.label}</CheckboxLabel>) : input;
}

export default withFormField(FormFieldCheckbox);