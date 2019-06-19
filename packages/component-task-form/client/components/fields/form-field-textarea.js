import React from 'react';
import styled from 'styled-components';

import { FormFieldInlineTaskHolder } from './form-field-inline-task';
import useFormValueBinding from './../../hooks/useFormValueBinding';
import withFormField from './withFormField'

import Label from 'ds-awards-theme/components/label';
import TextArea from 'ds-awards-theme/components/text-area';


const FormStyledTextArea = styled(TextArea)`

  ${FormFieldInlineTaskHolder} & {
      font-size: 14px;
      padding: 10px;
      min-height: 92px;
  }
`;


function FormFieldTextArea({data, binding, options = {}}) {

    const [value, _, handleInputChange] = useFormValueBinding(data, binding, "", (v) => v || "");
    const textInput = <FormStyledTextArea value={value || ""} onChange={handleInputChange} rows={options.rows || 2} />;

    return (
        <React.Fragment>
            {options.label ? <React.Fragment><Label>{options.label}</Label><br /></React.Fragment> : null}
            {textInput}
        </React.Fragment>
    );
}

export default withFormField(FormFieldTextArea);