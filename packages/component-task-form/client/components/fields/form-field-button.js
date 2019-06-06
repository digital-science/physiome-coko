import React from 'react';
import { FormFieldInlineTaskHolder } from './form-field-inline-task';

import Button, { PlainButtonStyle, SmallButtonStyle } from 'ds-awards-theme/components/button';
import styled from 'styled-components';

import withFormField from './withFormField';


const FormStyledButton = styled(Button)`

  ${FormFieldInlineTaskHolder} & {
    ${PlainButtonStyle}
    ${SmallButtonStyle}
  }
`;



function FormFieldButton({taskId, submitTaskOutcome, options}) {

    function handleSubmit(taskOutcome) {
        if(submitTaskOutcome && taskOutcome) {
            return submitTaskOutcome(taskId, taskOutcome, options);
        }
    }

    return (
        <FormStyledButton default={options.default || false} className={"form-field-button"}
            onClick={() => {handleSubmit(options.outcome)}}>{options.label}
        </FormStyledButton>
    );
}

export default withFormField(FormFieldButton);