import React, { useContext } from 'react';
import styled from 'styled-components';

import { withFormField, useFormValueBinding, fetchFields } from 'component-task-form/client';
import useClaimSubmissionMutation from './../mutations/claimSubmission';
import AuthenticatedUserContext from "component-authentication/client/AuthenticatedUserContext";

import { BlockLabel } from 'ds-awards-theme/components/label';
import { SmallInlineButton } from 'ds-awards-theme/components/inline-button';
import StaticText from 'ds-awards-theme/components/static-text';


function FormFieldSubmissionStatusPill({data, binding, instanceId, instanceType, refetchData, options = {}}) {

    const [identity] = useFormValueBinding(data, binding, null);
    const claimSubmission = useClaimSubmissionMutation(instanceType.name);
    const currentUser = useContext(AuthenticatedUserContext);

    const handleClaimSubmission = () => {
        claimSubmission(instanceId).then(r => {
            refetchData();
        });
    };

    const isAssignedToCurrentUser = (currentUser && identity && currentUser.id === identity.id);

    return (
        <ClaimSubmissionHolder>
            {options.label ? <BlockLabel>{options.label}</BlockLabel> : null}
            <div>
                {identity ?
                    <React.Fragment>
                        <StaticText>{identity.displayName}</StaticText>
                        {!isAssignedToCurrentUser ? <span> &mdash; <SmallInlineButton bordered={true} onClick={handleClaimSubmission}>Re-assign to me</SmallInlineButton></span> : null}
                    </React.Fragment>
                    :
                    (<SmallInlineButton bordered={true} onClick={handleClaimSubmission}>Assign to me</SmallInlineButton>)
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