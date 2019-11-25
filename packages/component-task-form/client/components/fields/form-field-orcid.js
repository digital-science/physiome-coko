import React from 'react';

import useFormValueBinding from './../../hooks/useFormValueBinding';
import useFormValidation from "../../hooks/useFormValidation";
import withFormField from './withFormField'

import ORCIDInput from 'ds-theme/components/orcid-input';
import Label from 'ds-theme/components/label';
import ValidationIssueListing from 'ds-theme/components/validation-issue-listing';


function FormFieldORCID({data, binding, description, formDefinition, formValidator, options = {}}) {

    const [value, setValue] = useFormValueBinding(data, binding, "", (v) => v || "");
    const [validationIssues, clearValidationIssues] = useFormValidation(description, formDefinition, formValidator);

    const setValidationIssue = () => {
        clearValidationIssues();
    };

    return (
        <React.Fragment>
            {options.label ? <Label>{options.label}</Label> : null}
            <ORCIDInput type="text" value={value || ""} setValue={setValue} issue={validationIssues && validationIssues.length} setValidationIssue={setValidationIssue} />
            { validationIssues ? <ValidationIssueListing issues={validationIssues} /> : null }
        </React.Fragment>
    );
}

export default withFormField(FormFieldORCID);