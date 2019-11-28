import React, { useState, useMemo } from 'react';
import styled from 'styled-components';
import { th } from 'ds-theme';

import useFormValueBinding from './../../hooks/useFormValueBinding';
import useFormValidation, {formFieldClassNameWithValidations} from "../../hooks/useFormValidation";
import withFormField from './withFormField'

import Checkbox, { CheckboxLabel } from 'ds-theme/components/checkbox-input';
import ValidationIssueListing from 'ds-theme/components/validation-issue-listing';
import PopoverTrigger from 'ds-theme/components/popover';

import { FaQuestionCircle, FaStarOfLife } from 'react-icons/fa';


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

const FormStyledRequiredIcon = styled.span`
    color: #e8aeae;
    & svg {
      font-size: 80%;
      /*vertical-align: middle;*/
      cursor: pointer;
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

function FormFieldCheckbox({className, data, binding, description, formDefinition, formValidator, options = {}}) {

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
    const misc = options.showAsRequired ? <FormStyledRequiredIcon><FaStarOfLife /></FormStyledRequiredIcon> : null;

    return (
        <div className={formFieldClassNameWithValidations(className, validationIssues)}>
            { options.label ?
                (<FormStyledLabel>{input}<span>{options.label}{help}{misc}</span></FormStyledLabel>)
                :
                <React.Fragment>{input}{help}{misc}</React.Fragment>
            }
            { validationIssues ? <ValidationIssueListing issues={validationIssues} /> : null }
        </div>
    );
}

export default withFormField(FormFieldCheckbox);