import React from 'react';
import styled from 'styled-components';

import { withFormField, useFormValueBinding, fetchFields } from 'component-task-form/client';
import useClaimSubmissionMutation from './../mutations/claimSubmission';

import { BlockLabel } from 'ds-awards-theme/components/label';
import { InlineButton } from 'ds-awards-theme/components/inline-button';
import StaticText from 'ds-awards-theme/components/static-text';
import useCompleteInstanceTask from "component-task-form/client/mutations/completeInstanceTask";


function FormFieldSubmissionStatusPill({data, binding, tasks, instanceId, instanceType, refetchData, options = {}, ...rest}) {

    const [identity] = useFormValueBinding(data, binding, "Pending");
    const claimSubmission = useClaimSubmissionMutation(instanceType.name);
    const completeInstanceTask = useCompleteInstanceTask(instanceType);

    const claimTask = (tasks && tasks.length && tasks.find(task => task.formKey === "custom:claim"));

    const handleClaimSubmission = () => {
        if(!claimTask) {
            return;
        }

        claimSubmission(instanceId).then(result => {
            if(result) {
                completeInstanceTask(instanceId, claimTask.id, {phase:"Checking"}).then(() => {
                    refetchData();
                });
            }
        });
    };


    return (
        <ClaimSubmissionHolder>
            {options.label ? <BlockLabel>{options.label}</BlockLabel> : null}
            <div>
                { claimTask ?
                    <InlineButton bordered={true} onClick={handleClaimSubmission}>Assign to me</InlineButton> :
                    (identity ? <StaticText>{identity.displayName}</StaticText> : <StaticText>No curator assigned</StaticText> )
                }
            </div>
        </ClaimSubmissionHolder>
    );
}

const ClaimSubmissionHolder = styled.div`  
`;

export default withFormField(FormFieldSubmissionStatusPill, function(element) {


    const topLevel = element.binding;
    const fetch = fetchFields(element.binding, `id, displayName`);

    return {topLevel, fetch};
});