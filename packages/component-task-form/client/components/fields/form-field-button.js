import React, { useState } from 'react';
import { FormFieldInlineTaskHolder, InlineTaskContext } from './form-field-inline-task';
import { BasicOverlay } from 'component-overlay';

import Button, { PlainButtonStyle, SmallButtonStyle } from 'ds-awards-theme/components/button';
import { InlineButton } from 'ds-awards-theme/components/inline-button';
import { th } from 'ds-awards-theme';

import styled from 'styled-components';

import withFormField from './withFormField';


const FormStyledButton = styled(Button)`

  ${FormFieldInlineTaskHolder} & {
    ${PlainButtonStyle}
    ${SmallButtonStyle}
  }
`;


const ConfirmationContent = styled.div`
  min-width: 400px;
`;

const ConfirmationHeading = styled.div`
  margin-bottom: 15px;
  font-family: ${th('modal.fontFamily')};
  font-size: ${th('modal.headingFontSize')};
  font-weight: ${th('modal.headingFontWeight')};
  color: ${th('modal.headingTextColor')};
`;

const ConfirmationMessage = styled.div`
  margin-top: 15px;
  margin-bottom: 15px;
  font-family: ${th('modal.fontFamily')};
  font-size: ${th('modal.messageFontSize')};
  color: ${th('modal.messageTextColor')};
`;


const ConfirmationButtonSet = styled.div`
  text-align: right;
  margin-top: 15px;
  
  > ${InlineButton} + ${InlineButton} {
    margin-left: 10px;
  }
`;


function FormFieldButton({taskId, submitTaskOutcome, context, options}) {

    const isInsideInlineForm = (context && context.length && context[0] === InlineTaskContext);
    const ButtonTag = isInsideInlineForm ? InlineButton : FormStyledButton;
    const [showConfirmation, setShowConfirmation] = useState(false);

    function handleSubmit(taskOutcome) {
        if(submitTaskOutcome && taskOutcome) {
            return submitTaskOutcome(taskId, taskOutcome, options);
        }
    }

    const additionalProps = {};
    if(isInsideInlineForm) {
        additionalProps.bordered = true;
    }

    const onClick = () => {

        if(!options.confirmation) {
            affirmativeOnClick();
            return;
        }

        if(showConfirmation) {
            setShowConfirmation(false);
            return;
        }

        setShowConfirmation(true);
    };

    const affirmativeOnClick = () => {
        handleSubmit(options.outcome);
    };

    const closeModal = () => {
        setShowConfirmation(false);
    };

    return (
        <React.Fragment>
            <ButtonTag default={options.default || false} className={"form-field-button"} onClick={onClick} {...additionalProps}>
                {options.label}
            </ButtonTag>
            {options.confirmation ? (
                <BasicOverlay isOpen={showConfirmation} onRequestClose={closeModal}>
                    <ConfirmationContent>
                        {options.confirmationHeading ? <ConfirmationHeading>{options.confirmationHeading}</ConfirmationHeading> : null}
                        {options.confirmation ? <ConfirmationMessage>{options.confirmation}</ConfirmationMessage> : null}

                        <ConfirmationButtonSet>
                            <InlineButton bordered={true} onClick={closeModal}>{options.confirmationNegativeLabel || "Cancel"}</InlineButton>
                            <InlineButton bordered={true} default={true} onClick={affirmativeOnClick}>{options.confirmationAffirmativeLabel || "Yes"}</InlineButton>
                        </ConfirmationButtonSet>
                    </ConfirmationContent>
                </BasicOverlay>
            ) : null}
        </React.Fragment>
    );
}

export default withFormField(FormFieldButton);