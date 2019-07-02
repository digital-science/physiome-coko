import React from 'react';
import styled from 'styled-components';

import { FormFieldInlineTaskHolder } from './form-field-inline-task';
import useFormValueBinding from './../../hooks/useFormValueBinding';
import useFormValidation from './../../hooks/useFormValidation';
import withFormField from './withFormField'

import Label from 'ds-awards-theme/components/label';
import TextArea from 'ds-awards-theme/components/text-area';
import ValidationIssueListing from 'ds-awards-theme/components/validation-issue-listing';


const FormStyledTextArea = styled(TextArea)`

  ${FormFieldInlineTaskHolder} & {
      font-size: 14px;
      padding: 10px;
      min-height: 92px;
  }
`;


function FormFieldTextArea({data, binding, description, formDefinition, formValidator, options = {}}) {

    const [value, _, handleInputChange] = useFormValueBinding(data, binding, "", (v) => v || "");
    const [validationIssues, clearValidationIssues] = useFormValidation(description, formDefinition, formValidator);

    const handleInputChangeWithWarningsClear = (e) => {
        clearValidationIssues();
        handleInputChange(e);
    };

    const textInput = (
        <FormStyledTextArea value={value || ""} onChange={handleInputChangeWithWarningsClear}
            rows={options.rows || 2} issue={validationIssues && validationIssues.length}  />
    );

    return (
        <React.Fragment>
            {options.label ? <React.Fragment><Label>{options.label}</Label><br /></React.Fragment> : null}
            {textInput}
            { validationIssues ? <ValidationIssueListing issues={validationIssues} /> : null }
        </React.Fragment>
    );
}

export default withFormField(FormFieldTextArea);