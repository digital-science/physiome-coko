import React, { useState, useMemo } from 'react';
import styled from 'styled-components';
import { th } from 'ds-awards-theme';

import useFormValueBinding from './../../hooks/useFormValueBinding';
import useFormValidation from "../../hooks/useFormValidation";
import withFormField from './withFormField'

import Checkbox, { CheckboxLabel } from 'ds-awards-theme/components/checkbox-input';
import ValidationIssueListing from 'ds-awards-theme/components/validation-issue-listing';
import PopoverTrigger from '../popover';

import { FaQuestionCircle } from 'react-icons/fa';


const FormStyledCheckbox = styled(Checkbox)`
  margin-top: 3px;
`;

const FormStyledLabel = styled(CheckboxLabel)`
  display: flex;
`;

const FormStyledHelp = styled.span`
    color: #909090;

    & svg {
      font-size: 80%;
      /*vertical-align: middle;*/
      cursor: pointer;
    }
    & svg:hover {
      color: #505050;
    }
    
    &:before {
      content: " "
    }
`;

const HelpContent = styled.span`
    font-family: ${th('helpPopover.fontFamily')};
    font-size: ${th('helpPopover.fontSize')};
    color: ${th('helpPopover.textColor')};
    max-width: ${th('helpPopover.maximumWidth')};
    
`;

function FormFieldCheckbox({data, binding, description, formDefinition, formValidator, options = {}}) {

    const [value, _, handleInputChange] = useFormValueBinding(data, binding, "", (v) => v || "");
    const [validationIssues, clearValidationIssues] = useFormValidation(description, formDefinition, formValidator);
    const [helpIsShown, setHelpIsShown] = useState(false);

    const help = useMemo(() => {

        if(!options.help) {
            return null;
        }

        return (
            <FormStyledHelp>
                <PopoverTrigger onVisibilityChange={v => setHelpIsShown(v)} renderContent={(props) => <HelpContent>{options.help}</HelpContent>}>
                    <FaQuestionCircle />
                </PopoverTrigger>
            </FormStyledHelp>
        );

    }, [options.help]);

    const handleCheckedChange = (e) => {
        if(options.readOnly || helpIsShown) {
            return;
        }
        clearValidationIssues();
        handleInputChange(e);
    };

    const input = <FormStyledCheckbox checked={value || false} disabled={options.readOnly || false} onChange={handleCheckedChange} />;

    return (
        <React.Fragment>
            { options.label ?
                (<FormStyledLabel>{input}<span>{options.label}{help}</span></FormStyledLabel>)
                :
                <React.Fragment>{input}{help}</React.Fragment>
            }
            { validationIssues ? <ValidationIssueListing issues={validationIssues} /> : null }
        </React.Fragment>
    );
}

export default withFormField(FormFieldCheckbox);