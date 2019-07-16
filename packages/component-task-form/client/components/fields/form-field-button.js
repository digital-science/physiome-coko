import React, { useState, useMemo } from 'react';
import { FormFieldInlineTaskHolder, InlineTaskContext } from './form-field-inline-task';
import FieldListing from '../field-listing';
import FormValidator from '../../utils/FormValidator';

import { BasicOverlay } from 'component-overlay';

import Button, { PlainButtonStyle, SmallButtonStyle } from 'ds-theme/components/button';
import { InlineButton } from 'ds-theme/components/inline-button';
import { th } from 'ds-theme';

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
  max-width: 550px;
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

const _noopSubmitTaskOutcome = () => {
    console.error(`form-field-button - confirmation dialog child element (via field listing) attempted to submit a task outcome`);
};


const ConfirmationDialogContext = { content: "ConfirmationDialog" };
export { ConfirmationDialogContext };


function FormFieldButton({instanceType, data, taskId, submitTaskOutcome, description, context, formDefinition, formValidator, options = {}, ...rest}) {

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

    const closeModal = () => {
        setShowConfirmation(false);
    };

    const [confirmationFormValidator, confirmationFormDefinition] = useMemo(() => {

        if(!options.confirmationValidation || !options.confirmationValidation.length) {
            return [null, null];
        }

        const validations = instanceType.validationListForValidationNameSet(options.confirmationValidation);
        return [new FormValidator(), new ConfirmationFormDefinition(validations)];

    }, [instanceType, options.confirmationValidation]);


    const affirmativeOnClick = () => {

        if(confirmationFormValidator && !confirmationFormValidator.validate(data)) {
            return;
        }

        handleSubmit(options.outcome);
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

                        {description.children ?
                            <FieldListing elements={description.children} data={data} instanceType={instanceType} taskId={taskId} context={[ConfirmationDialogContext, ...context]}
                                submitTaskOutcome={_noopSubmitTaskOutcome} formValidator={confirmationFormValidator} formDefinition={confirmationFormDefinition} {...rest} /> : null
                        }

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




class ConfirmationFormDefinition {

    constructor(validations) {
        this.validations = validations;
    }

    findMatchingValidations(formElement) {
        if(!this.validations || !this.validations.length) {
            return null;
        }
        if(!formElement.binding) {
            return null;
        }
        const m = this.validations.filter(v => v.target === formElement.binding);
        return m.length ? m : null;
    }
}