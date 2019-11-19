import React, { useContext, useRef } from 'react';
import { WorkflowDescriptionContext } from 'client-workflow-model'
import styled from 'styled-components';

import { instanceViewTypeForViewDefinition } from 'component-task-form/client'
import { useSubmissionPublishedSubscription } from '../subscriptions/submissionPublished';
import debounce from "lodash/debounce";
import {useInstanceWasCreatedSubscription} from "component-task-listing/client/subscriptions/instanceChanged";

const SubmissionInstanceType = 'Submission';
const SubmissionDetailsViewName = "details";



function SubmissionDetails({match, children}) {

    const { instanceId } = match.params;
    const workflowDescription = useContext(WorkflowDescriptionContext);

    const instanceType = workflowDescription.findInstanceType(SubmissionInstanceType);
    if(!instanceType) {
        throw new Error(`Unable to find task definition for type '${SubmissionInstanceType}'.`);
    }

    const viewDefinition = instanceType.viewDefinitionForViewName(SubmissionDetailsViewName);
    if(!viewDefinition) {
        throw new Error(`Unable to find view definition for view name '${SubmissionDetailsViewName}'.`);
    }

    const InstanceViewType = instanceViewTypeForViewDefinition(viewDefinition);
    if(!InstanceViewType) {
        throw new Error("Unable to find task view type for view definition.");
    }

    const instanceViewProps = {instanceId, instanceType, layoutDefinition:viewDefinition, workflowDescription};

    // Subscribe to changes in the published status of an submission and refresh the data when it changes.
    // Note: the dataContextRef is provided by the instance view type implementation and provides methods
    // to refetch data, save data, current data etc.

    const dataContextRef = useRef(null);
    const throttledRefetch = debounce(() => {

        if(dataContextRef.current) {
            const { refetchData } = dataContextRef.current;
            if(refetchData) {
                refetchData();
            }
        }
    }, 2000, { leading: true, trailing: true, maxWait:2000 });

    useSubmissionPublishedSubscription(submissionId => {

        if(!dataContextRef.current) {
            return;
        }

        const { instanceId } = dataContextRef.current;
        if(submissionId === instanceId) {
            return throttledRefetch();
        }
    });


    return (
        <SubmissionDetailsPageHolder>
            {children ? <SubmissionDetailsPageHeader>{children}</SubmissionDetailsPageHeader> : null}
            <SubmissionDetailsHeader>Submission Details</SubmissionDetailsHeader>
            <SubmissionDetailsHolder>
                <InstanceViewType {...instanceViewProps} dataContextRef={dataContextRef} />
            </SubmissionDetailsHolder>
        </SubmissionDetailsPageHolder>
    );
}

const SubmissionDetailsPageHeader = styled.div`
    margin-left: -20px;
    margin-right: -20px;
`;

const SubmissionDetailsPageHolder = styled.div`
    padding-left: 20px;
    padding-right: 20px;
    background: white;
    min-height: calc(100vh - 70px);
    border-top: 2px solid #ebebeb;
`;

const SubmissionDetailsHeader = styled.div`
  font-family: NovcentoSansWideNormal, sans-serif;
  text-transform: uppercase;
  text-align: center;
  font-size: 28px;
  color: #828282;
  padding: 20px;
`;

const SubmissionDetailsHolder = styled.div`
`;


export default SubmissionDetails;