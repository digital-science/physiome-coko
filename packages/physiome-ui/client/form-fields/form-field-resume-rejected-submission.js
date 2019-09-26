import React from 'react';
import styled from 'styled-components';

import { withFormField } from 'component-task-form/client';
import useResumeRejectedSubmissionMutation from './../mutations/resumeRejectedSubmission';

import { BlockLabel } from 'ds-theme/components/label';
import { InlineButton } from 'ds-theme/components/inline-button';


function FormFieldResumeRejectedSubmission({instanceId, instanceType, refetchData, options = {}}) {

    const resumeRejectedSubmission = useResumeRejectedSubmissionMutation(instanceType);

    const handleResumeRejectedSubmission = () => {
        resumeRejectedSubmission(instanceId).then(r => {
            refetchData();
        });
    };

    return (
        <ResumeRejectedSubmissionHolder>
            {options.label ? <BlockLabel>{options.label}</BlockLabel> : null}
            <InlineButton bordered={true} onClick={handleResumeRejectedSubmission}>Resume Rejected Submission</InlineButton>
        </ResumeRejectedSubmissionHolder>
    );
}

const ResumeRejectedSubmissionHolder = styled.div`  
`;

export default withFormField(FormFieldResumeRejectedSubmission);