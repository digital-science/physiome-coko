import React from 'react';
import { FormFieldInlineTaskHolder, InlineTaskContext } from './form-field-inline-task';

import Button, { PlainButtonStyle, SmallButtonStyle } from 'ds-awards-theme/components/button';
import { InlineButton } from 'ds-awards-theme/components/inline-button';

import styled from 'styled-components';

import withFormField from './withFormField';


const FormStyledButton = styled(Button)`

  ${FormFieldInlineTaskHolder} & {
    ${PlainButtonStyle}
    ${SmallButtonStyle}
  }
`;



function FormFieldButton({taskId, submitTaskOutcome, context, options}) {

    const isInsideInlineForm = (context && context.length && context[0] === InlineTaskContext);
    const ButtonTag = isInsideInlineForm ? InlineButton : FormStyledButton;

    function handleSubmit(taskOutcome) {
        if(submitTaskOutcome && taskOutcome) {
            return submitTaskOutcome(taskId, taskOutcome, options);
        }
    }

    const additionalProps = {};
    if(isInsideInlineForm) {
        additionalProps.bordered = true;
    }

    return (
        <ButtonTag default={options.default || false} className={"form-field-button"} onClick={() => {handleSubmit(options.outcome)}} {...additionalProps}>
            {options.label}
        </ButtonTag>
    );
}

export default withFormField(FormFieldButton);