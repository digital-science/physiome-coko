import React, { useState } from 'react';
import styled from 'styled-components';

import { BasicMessage, BasicMessageButton } from 'component-overlay';

import useTimedMinimumDisplay from './../hooks/useTimedMinimumDisplay';
import useFormInstanceData, { SubmitTaskFailureReason } from './../hooks/useFormInstanceData';

import SimplePanelLayout, { DecisionPanelHolder } from './simple-panel-layout';


const StyledSimplePanelLayout = styled(SimplePanelLayout)`

  & ${DecisionPanelHolder} {
      padding-top: 40px;
      padding-bottom: 40px;
  }
`;

export default function SimpleTaskForm({ className, instanceId, taskId, taskName, instanceType, formDefinition, workflowDescription,
                                         submitDidFail, wasSubmitted, renderNoTask, dataContextRef=null, autoSave=true }) {

    const [showIsSaving, displayIsSavingMessage, removeIsSavingMessage] = useTimedMinimumDisplay(1500);
    const [showValidatedUserRequired, setShowValidatedUserRequired] = useState(false);

    const onSubmitFail = (reason) => {
        if(submitDidFail) {
            return submitDidFail(reason);
        }

        if(reason === SubmitTaskFailureReason.RequiresValidatedSubmitter) {
            setShowValidatedUserRequired(true);
        }
        return Promise.resolve(reason);
    };

    const fd = useFormInstanceData({instanceId, taskId, taskName, instanceType, formDefinition, workflowDescription,
                                    submitDidFail:onSubmitFail, wasSubmitted, enableAutoSave:autoSave, displayIsSavingMessage,
                                    removeIsSavingMessage});
    const {instance, error, loading, task, resolvedTaskId, submitTaskOutcome, formData, formValidator, refetchFormData, fieldRegistry} = fd;

    const fieldListingProps = {fieldRegistry, data:formData, refetchData:refetchFormData, formValidator, instanceId,
                               instanceType, task, taskId:resolvedTaskId, formDefinition, submitTaskOutcome};
    if(dataContextRef) {
        dataContextRef.current = fieldListingProps;
    }

    return (
        <React.Fragment>
            <StyledSimplePanelLayout className={className} elements={formDefinition.elements} data={formData} loading={loading} error={error}
                instance={instance} fieldListingProps={fieldListingProps} showIsSaving={showIsSaving} renderNoTask={renderNoTask} />

            <BasicMessage isOpen={showValidatedUserRequired} closeOverlay={() => setShowValidatedUserRequired(false)} heading="Email Verification Required"
                message="Before you can proceed to submitting your manuscript, the email address associated with your account must be verified. Please check your email for a verification link."
                buttons={
                    <BasicMessageButton onClick={() => setShowValidatedUserRequired(false)}>Continue</BasicMessageButton>
                }
            />
        </React.Fragment>
    );
};