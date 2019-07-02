import React from 'react';

import useFormValueBinding from './../../hooks/useFormValueBinding';
import useFormValidation from "../../hooks/useFormValidation";
import withFormField from './withFormField'

import TextInput from 'ds-awards-theme/components/text-input';
import Label from 'ds-awards-theme/components/label';
import ValidationIssueListing from 'ds-awards-theme/components/validation-issue-listing';

function FormFieldText({data, binding, description, formDefinition, formValidator, options = {}}) {

    const [value, _, handleInputChange] = useFormValueBinding(data, binding, "", (v) => v || "");
    const [validationIssues, clearValidationIssues] = useFormValidation(description, formDefinition, formValidator);

    const handleInputChangeWithWarningsClear = (e) => {
        clearValidationIssues();
        handleInputChange(e);
    };

    const textInput = (
        <TextInput type="text" value={value || ""} onChange={handleInputChangeWithWarningsClear}
            issue={validationIssues && validationIssues.length} />
    );

    return (
        <React.Fragment>
            {options.label ? <Label>{options.label}</Label> : null}
            {textInput}
            { validationIssues ? <ValidationIssueListing issues={validationIssues} /> : null }
        </React.Fragment>
    );
}

export default withFormField(FormFieldText);