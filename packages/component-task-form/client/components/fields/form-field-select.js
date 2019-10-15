import React, { useMemo } from 'react';
import styled from 'styled-components';

import useFormValueBinding from './../../hooks/useFormValueBinding';
import useFormValidation from "../../hooks/useFormValidation";
import withFormField from './withFormField'

import { ConfirmationDialogContext } from './form-field-button';

import { Select, SmallSelect } from 'ds-theme/components/select-input';
import { BlockLabel } from 'ds-theme/components/label';
import ValidationIssueListing from 'ds-theme/components/validation-issue-listing';
import {NoteStaticText} from "ds-theme/components/static-text";


function FormFieldSelect({data, binding, description, formDefinition, formValidator, context, options = {}}) {

    const [value, _, handleInputChange] = useFormValueBinding(data, binding, "", (v) => v || "");
    const [validationIssues, clearValidationIssues] = useFormValidation(description, formDefinition, formValidator);
    const isInsideConfirmationDialog = context && context[0] === ConfirmationDialogContext;
    const { message = null } = options;

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

    const SelectInputType = isInsideConfirmationDialog ? SmallSelect : Select;

    const selectInput = (
        <SelectInputType value={value || ""} placeholder={options.placeholder} issue={validationIssues && validationIssues.length}
            onChange={handleInputChangeWithIssuesClear} options={optValues} />
    );

    return (
        <React.Fragment>
            {options.label ? <BlockLabel className={isInsideConfirmationDialog ? 'dialog' : ''}>{options.label}</BlockLabel> : null}
            {selectInput}
            {validationIssues ? <ValidationIssueListing issues={validationIssues} /> : (message ? <NoteStaticText dangerouslySetInnerHTML={{__html: message}} /> : null)}
        </React.Fragment>
    );
}




/*
 */

export default styled(withFormField(FormFieldSelect))`

  > ${BlockLabel}.dialog {
      font-size: 14px;
  }

  > select {
       width: auto;
       display: block;
       min-width: 33%;
       border: 1px solid #b1b1b1;
       background: white;
       margin-top: 4px;
  }
  
  & > ${NoteStaticText} {
    display: block;
    margin-top: 4px;
  }

`;