import React, { useContext } from 'react';
import styled from 'styled-components';

import { withFormField, useFormValueBinding, fetchFields } from 'component-task-form/client';
import useClaimSubmissionMutation from './../mutations/claimSubmission';
import useUnclaimSubmissionMutation from './../mutations/unclaimSubmission';
import AuthenticatedUserContext from "component-authentication/client/AuthenticatedUserContext";

import { BlockLabel } from 'ds-theme/components/label';
import { SmallInlineButton } from 'ds-theme/components/inline-button';
import StaticText from 'ds-theme/components/static-text';


function FormFieldClaimSubmission({data, binding, instanceId, instanceType, saveData, refetchData, options = {}}) {

    const [identity] = useFormValueBinding(data, binding, null);
    const claimSubmission = useClaimSubmissionMutation(instanceType);
    const unclaimSubmission = useUnclaimSubmissionMutation(instanceType);
    const currentUser = useContext(AuthenticatedUserContext);

    const handleClaimSubmission = () => {
        (saveData ? saveData() : Promise.resolve()).then(() => {
            return claimSubmission(instanceId);
        }).then(r => {
            return refetchData();
        });
    };

    const handleUnclaimSubmission = () => {

        (saveData ? saveData() : Promise.resolve()).then(() => {
            return unclaimSubmission(instanceId);
        }).then(r => {
            return refetchData();
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
                            <span> &mdash; <SmallInlineButton bordered={true} onClick={handleUnclaimSubmission}>Un-assign Myself</SmallInlineButton></span>
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

export default withFormField(FormFieldClaimSubmission, function(element) {

    const topLevel = element.binding;
    const fetch = fetchFields(element.binding, `id, displayName`);

    return {topLevel, fetch};
});