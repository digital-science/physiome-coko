import React from 'react';
import styled from 'styled-components';

import useFormValueBinding from './../../hooks/useFormValueBinding';
import useFormValidation, {formFieldClassNameWithValidations} from './../../hooks/useFormValidation';
import withFormField from './withFormField'

import Checkbox, { CheckboxLabel } from 'ds-theme/components/checkbox-input';
import { BlockLabel } from 'ds-theme/components/label';
import ValidationIssueListing from 'ds-theme/components/validation-issue-listing';


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





function FormFieldCheckbox({className, data, binding, description, formDefinition, formValidator, options = {}}) {

    const [value, _, handleInputChange] = useFormValueBinding(data, binding, "", (v) => v || "");
    const [validationIssues, clearValidationIssues] = useFormValidation(description, formDefinition, formValidator);

    const handleCheckedChange = options.readOnly === true ? null : (e) => {
        clearValidationIssues();
        handleInputChange(e);
    };
    const input = <HeroCheckbox checked={value || false} disabled={options.readOnly || false} onChange={handleCheckedChange} />;

    return (
        <HeroCheckboxHolder className={formFieldClassNameWithValidations(className, validationIssues)}>
            {options.heading ? <BlockLabel>{options.heading}</BlockLabel> : null}
            {options.label ? (
                <HeroCheckboxLabel issues={validationIssues && validationIssues.length}>{input} <span>{options.label}</span></HeroCheckboxLabel>) : input
            }
            <div>
                { validationIssues ? <ValidationIssueListing issues={validationIssues} /> : null }
            </div>
        </HeroCheckboxHolder>
    );
}

export default withFormField(FormFieldCheckbox);