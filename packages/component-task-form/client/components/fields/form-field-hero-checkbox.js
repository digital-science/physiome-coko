import React from 'react';
import styled from 'styled-components';

import useFormValueBinding from './../../hooks/useFormValueBinding';
import withFormField from './withFormField'

import Checkbox, { CheckboxLabel } from 'ds-awards-theme/components/checkbox-input';
import { BlockLabel } from 'ds-awards-theme/components/label';


const HeroCheckboxHolder = styled.div`

  & > ${BlockLabel} {
    margin-bottom: 5px;
  }
`;

const HeroCheckbox = styled(Checkbox)`
  font-size: 16px;
  margin-right: 10px;
`;

const HeroCheckboxLabel = styled(CheckboxLabel)`
  display: flex;
  font-size: 16px;
`;


function FormFieldCheckbox({data, binding, options = {}}) {

    const [value, _, handleInputChange] = useFormValueBinding(data, binding, "", (v) => v || "");
    const handleCheckedChange = options.readOnly === true ? null : handleInputChange;
    const input = <HeroCheckbox checked={value || false} disabled={options.readOnly || false} onChange={handleCheckedChange} />;

    return (
        <HeroCheckboxHolder>
            {options.heading ? <BlockLabel>{options.heading}</BlockLabel> : null}
            {options.label ? (<HeroCheckboxLabel>{input} <span>{options.label}</span></HeroCheckboxLabel>) : input}
        </HeroCheckboxHolder>
    );
}

export default withFormField(FormFieldCheckbox);