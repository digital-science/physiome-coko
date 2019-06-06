import React, { useContext } from 'react';
import { WorkflowDescriptionContext } from 'client-workflow-model'
import styled from 'styled-components';

import SubmissionDetails from 'component-submission-details/client';

const SubmissionType = 'submission';
const SubmissionDetailsViewName = "details";


function SubmissionDetailsPage({match}) {

    const { instanceId } = match.params;
    const WorkflowDescription = useContext(WorkflowDescriptionContext);

    const instanceType = WorkflowDescription.findInstanceTypeForUrlName(SubmissionType);
    if(!instanceType) {
        throw new Error(`Unable to find task definition for type '${SubmissionType}'.`);
    }

    const viewDefinition = instanceType.viewDefinitionForViewName(SubmissionDetailsViewName);
    if(!viewDefinition) {
        throw new Error(`Unable to find view definition for view name '${SubmissionDetailsViewName}'.`);
    }

    return (
        <SubmissionDetailsPageHolder>
            <SubmissionDetailsHeader>Submission Details</SubmissionDetailsHeader>
            <SubmissionDetails instanceId={instanceId} instanceType={instanceType}
                viewDefinition={viewDefinition} workflowDescription={WorkflowDescription} />
        </SubmissionDetailsPageHolder>
    );
}


const SubmissionDetailsPageHolder = styled.div`
    padding-left: 20px;
    padding-right: 20px;
`;

const SubmissionDetailsHeader = styled.div`
    text-align: center;
    font-family: ProximaNovaBold,sans-serif;
    color: white;
    font-size: 20px;
    padding-bottom: 12px;
    padding-top: 12px;
    background: #3496af;
    margin-bottom: 20px;
    margin-right: -20px;
    margin-left: -20px;
    border-bottom: 3px solid white;
`;


export default SubmissionDetailsPage;