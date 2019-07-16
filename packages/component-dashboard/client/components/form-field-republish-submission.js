import React from 'react';
import styled from 'styled-components';

import { withFormField } from 'component-task-form/client';
import useRepublishSubmissionMutation from './../mutations/republishSubmission';

import { BlockLabel } from 'ds-theme/components/label';
import { InlineButton } from 'ds-theme/components/inline-button';


function FormFieldRepublishSubmission({instanceId, instanceType, refetchData, options = {}}) {

    const republishSubmission = useRepublishSubmissionMutation(instanceType.name);

    const handleRepublishSubmission = () => {
        republishSubmission(instanceId).then(r => {
            refetchData();
        });
    };

    return (
        <RepublishSubmissionHolder>
            {options.label ? <BlockLabel>{options.label}</BlockLabel> : null}
            <InlineButton bordered={true} onClick={handleRepublishSubmission}>Republish Submission</InlineButton>
        </RepublishSubmissionHolder>
    );
}

const RepublishSubmissionHolder = styled.div`
`;

export default withFormField(FormFieldRepublishSubmission);