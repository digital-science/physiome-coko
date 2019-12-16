import React, { useState, useLayoutEffect } from 'react';
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

const BlockingProcessList = styled.ol`
  list-style-type: disc;
  padding: 0;
  margin: 0;
  font-family: ProximaNovaLight,sans-serif;
  font-size: 14px;
  color: #505050;
  padding-left: 15px;
      
  & > li {
    
  }  
`;

export default function SimpleTaskForm({ className, instanceId, taskId, taskName, instanceType, formDefinition, workflowDescription,
                                         submitDidFail, wasSubmitted, renderNoTask, renderPageAdditionsWithData=null, dataContextRef=null, autoSave=true }) {

    const [showIsSaving, displayIsSavingMessage, removeIsSavingMessage] = useTimedMinimumDisplay(1500);
    const [showValidatedUserRequired, setShowValidatedUserRequired] = useState(false);
    const [lastSubmitFailed, setLastSubmitFailed] = useState(false);

    const [showBlockingProcessMessage, setShowBlockingProcessMessage] = useState(false);
    const [blockingProcesses, setBlockingProcesses] = useState(null);

    const onSubmitFail = (reason, data) => {
        if(submitDidFail) {
            return submitDidFail(reason);
        }

        if(reason === SubmitTaskFailureReason.RequiresValidatedSubmitter) {
            setShowValidatedUserRequired(true);
        } else if(reason === SubmitTaskFailureReason.FormValidationFailed) {
            setLastSubmitFailed(true);
        } else if(reason === SubmitTaskFailureReason.FormBlockingProcesses) {
            setShowBlockingProcessMessage(true);
            setBlockingProcesses(data ? data.map(d => d.message) : null);
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

    useLayoutEffect(() => {

        if(lastSubmitFailed) {

            const formFieldsWithIssues = document.getElementsByClassName('target-form-field-has-issues');
            if(formFieldsWithIssues && formFieldsWithIssues.length) {

                const target = formFieldsWithIssues[0].classList.contains("") ? formFieldsWithIssues[0] : formFieldsWithIssues[0].closest(".form-field");

                if(target && typeof target.scrollIntoView !== "undefined") {
                    target.scrollIntoView();
                }
            }

            setLastSubmitFailed(false);
        }

    }, [lastSubmitFailed]);

    return (
        <React.Fragment>
            <StyledSimplePanelLayout className={className} elements={formDefinition.elements} data={formData} loading={loading} error={error}
                instance={instance} fieldListingProps={fieldListingProps} showIsSaving={showIsSaving} renderNoTask={renderNoTask} />

            {renderPageAdditionsWithData && data && !loading ? renderPageAdditionsWithData(instance, formData) : null}

            <BasicMessage isOpen={showValidatedUserRequired} closeOverlay={() => setShowValidatedUserRequired(false)} heading="Email Verification Required"
                message="Before you can submit your manuscript, the email address associated with your account must be verified. Please check your registered email address for a verification link that has been sent."
                buttons={
                    <BasicMessageButton onClick={() => setShowValidatedUserRequired(false)}>Continue</BasicMessageButton>
                }
            />

            <BasicMessage isOpen={showBlockingProcessMessage} closeOverlay={() => setShowBlockingProcessMessage(false)} heading="Unable to Submit Form"
                message="The submission is unable to be submitted at this time due to the following reasons:"
                buttons={
                    <BasicMessageButton onClick={() => setShowBlockingProcessMessage(false)}>Continue</BasicMessageButton>
                }>
                <BlockingProcessList>
                    {blockingProcesses ? blockingProcesses.map((p, index)=> <li key={index}>{p}</li>) : null}
                </BlockingProcessList>
            </BasicMessage>
        </React.Fragment>
    );
};