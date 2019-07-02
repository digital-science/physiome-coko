import React, { useMemo } from 'react';
import styled from 'styled-components';

import useFormValueBinding from './../../hooks/useFormValueBinding';
import useFormValidation from "../../hooks/useFormValidation";
import withFormField from './withFormField'

import SelectInput from 'ds-awards-theme/components/select-input';
import Label from 'ds-awards-theme/components/label';
import ValidationIssueListing from 'ds-awards-theme/components/validation-issue-listing';

function FormFieldSelect({data, binding, description, formDefinition, formValidator, options = {}}) {

    const [value, _, handleInputChange] = useFormValueBinding(data, binding, "", (v) => v || "");
    const [validationIssues, clearValidationIssues] = useFormValidation(description, formDefinition, formValidator);

    const handleInputChangeWithIssuesClear = (e) => {
        clearValidationIssues();
        handleInputChange(e);
    };

    const optValues = useMemo(() => {

        if(!options.options) {
            return [];
        }

        const mapping = options.options.values;
        if(!mapping) {
            return [];
        }

        return Object.keys(mapping).map(k => {
            return {value:k, display:mapping[k]};
        });

    }, [options, options.values]);

    const selectInput = (
        <SelectInput value={value || ""} placeholder={options.placeholder} issue={validationIssues && validationIssues.length}
            onChange={handleInputChangeWithIssuesClear} options={optValues} />
    );

    return (
        <React.Fragment>
            {options.label ? <Label>{options.label}</Label> : null}
            {selectInput}
            { validationIssues ? <ValidationIssueListing issues={validationIssues} /> : null }
        </React.Fragment>
    );
}




/*
 */

export default styled(withFormField(FormFieldSelect))`

  > select {
       width: auto;
       display: block;
       min-width: 33%;
       border: 1px solid #b1b1b1;
       background: white;
       margin-top: 4px;
  }

`;