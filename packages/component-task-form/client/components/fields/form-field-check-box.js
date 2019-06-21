import React from 'react';
import styled from 'styled-components';

import useFormValueBinding from './../../hooks/useFormValueBinding';
import withFormField from './withFormField'

import Checkbox, { CheckboxLabel } from 'ds-awards-theme/components/checkbox-input';


const FormStyledCheckbox = styled(Checkbox)`
  margin-top: 3px;
`;

const FormStyledLabel = styled(CheckboxLabel)`
  display: flex;
`;

function FormFieldCheckbox({data, binding, options = {}}) {

    const [value, _, handleInputChange] = useFormValueBinding(data, binding, "", (v) => v || "");
    const handleCheckedChange = options.readOnly === true ? null : handleInputChange;
    const input = <FormStyledCheckbox checked={value || false} disabled={options.readOnly || false} onChange={handleCheckedChange} />;

    return options.label ? (<FormStyledLabel>{input}<span>{options.label}</span></FormStyledLabel>) : input;
}

export default withFormField(FormFieldCheckbox);


/*
  display: flex;
 */