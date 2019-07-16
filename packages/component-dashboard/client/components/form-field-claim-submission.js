import React, { useContext } from 'react';
import styled from 'styled-components';

import { withFormField, useFormValueBinding, fetchFields } from 'component-task-form/client';
import useClaimSubmissionMutation from './../mutations/claimSubmission';
import useUnclaimSubmissionMutation from './../mutations/unclaimSubmission';
import AuthenticatedUserContext from "component-authentication/client/AuthenticatedUserContext";

import { BlockLabel } from 'ds-theme/components/label';
import { SmallInlineButton } from 'ds-theme/components/inline-button';
import StaticText from 'ds-theme/components/static-text';


function FormFieldSubmissionStatusPill({data, binding, instanceId, instanceType, refetchData, options = {}}) {

    const [identity] = useFormValueBinding(data, binding, null);
    const claimSubmission = useClaimSubmissionMutation(instanceType.name);
    const unclaimSubmission = useUnclaimSubmissionMutation(instanceType.name);
    const currentUser = useContext(AuthenticatedUserContext);

    const handleClaimSubmission = () => {
        claimSubmission(instanceId).then(r => {
            refetchData();
        });
    };

    const handleUnclaimSubmission = () => {
        unclaimSubmission(instanceId).then(r => {
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
                        {!isAssignedToCurrentUser ?
                            <span> &mdash; <SmallInlineButton bordered={true} onClick={handleClaimSubmission}>Assign Myself</SmallInlineButton></span>
                            :
                            <span> &mdash; <SmallInlineButton bordered={true} onClick={handleUnclaimSubmission}>Unassign Myself</SmallInlineButton></span>
                        }
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