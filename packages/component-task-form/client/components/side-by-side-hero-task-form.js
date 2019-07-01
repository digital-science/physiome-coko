import React, { useState } from 'react';
import styled from 'styled-components';

import { BasicMessage, BasicMessageButton } from 'component-overlay';

import useTimedMinimumDisplay from './../hooks/useTimedMinimumDisplay';
import useFormInstanceData, { SubmitTaskFailureReason } from './../hooks/useFormInstanceData';

import SideBySideHeroLayout, { DecisionPanelHolder } from './side-by-side-hero-layout';


const StyledSideBySideHeroLayout = styled(SideBySideHeroLayout)`

  & ${DecisionPanelHolder} {
      padding-top: 40px;
      padding-bottom: 40px;
  }
`;

export default function SideBySideHeroTaskForm({ instanceId, taskId, taskName, instanceType, formDefinition, workflowDescription, submitDidFail, wasSubmitted, autoSave=true }) {

    const [showIsSaving, displayIsSavingMessage, removeIsSavingMessage] = useTimedMinimumDisplay(1500);
    const [showValidatedUserRequired, setShowValidatedUserRequired] = useState(false);

    const onSubmitFail = (reason) => {
        if(submitDidFail) {
            return submitDidFail(reason);
        }

        if(reason === SubmitTaskFailureReason.RequiresValidatedSubmitter) {
            setShowValidatedUserRequired(true);
        }
    };

    const fd = useFormInstanceData({instanceId, taskId, taskName, instanceType, formDefinition, workflowDescription,
                                    submitDidFail:onSubmitFail, wasSubmitted, autoSave, displayIsSavingMessage,
                                    removeIsSavingMessage});
    const {instance, error, loading, resolvedTaskId, submitTaskOutcome, formData, formValidator, refetchFormData, fieldRegistry} = fd;

    const fieldListingProps = {fieldRegistry, data:formData, refetchData:refetchFormData, formValidator, instanceId,
                               instanceType, taskId:resolvedTaskId, formDefinition, submitTaskOutcome};

    return (
        <React.Fragment>
            <StyledSideBySideHeroLayout elements={formDefinition.elements} data={formData} loading={loading} error={error}
                instance={instance} fieldListingProps={fieldListingProps} showIsSaving={showIsSaving} />

            <BasicMessage isOpen={showValidatedUserRequired} closeOverlay={() => setShowValidatedUserRequired(false)} heading="Email Verification Required"
                message="Before you can proceed to submitting your manuscript, the email address associated with your account must be verified. Please check your email for a verification link."
                buttons={
                    <BasicMessageButton onClick={() => setShowValidatedUserRequired(false)}>Continue</BasicMessageButton>
                }
            />

        </React.Fragment>
    );
};