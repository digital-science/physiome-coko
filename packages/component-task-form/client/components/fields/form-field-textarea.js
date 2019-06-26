import React from 'react';
import styled from 'styled-components';

import { FormFieldInlineTaskHolder } from './form-field-inline-task';
import useFormValueBinding from './../../hooks/useFormValueBinding';
import useFormValidation from './../../hooks/useFormValidation';
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


function FormFieldTextArea({data, binding, description, formDefinition, formValidator, options = {}}) {

    const [value, _, handleInputChange] = useFormValueBinding(data, binding, "", (v) => v || "");
    const [validationWarnings, clearValidationWarnings] = useFormValidation(description, formDefinition, formValidator);

    const handleInputChangeWithWarningsClear = (e) => {
        clearValidationWarnings();
        handleInputChange(e);
    };

    const textInput = (
        <FormStyledTextArea value={value || ""} onChange={handleInputChangeWithWarningsClear}
            rows={options.rows || 2} issue={validationWarnings && validationWarnings.length}  />
    );

    return (
        <React.Fragment>
            {options.label ? <React.Fragment><Label>{options.label}</Label><br /></React.Fragment> : null}
            {textInput}
            { validationWarnings ? validationWarnings.map((warning, index) => <div key={index}>{warning}</div>) : null }
        </React.Fragment>
    );
}

export default withFormField(FormFieldTextArea);