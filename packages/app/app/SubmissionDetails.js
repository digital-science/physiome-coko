import React, { useContext } from 'react';
import { WorkflowDescriptionContext } from 'client-workflow-model'
import styled from 'styled-components';

import SubmissionDetails from 'component-submission-details/client';

const SubmissionType = 'submission';
const SubmissionDetailsViewName = "details";


function SubmissionDetailsPage({match, children}) {

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
            {children ? <SubmissionDetailsPageHeader>{children}</SubmissionDetailsPageHeader> : null}
            <SubmissionDetailsHeader>Submission Details</SubmissionDetailsHeader>
            <SubmissionDetails instanceId={instanceId} instanceType={instanceType}
                viewDefinition={viewDefinition} workflowDescription={WorkflowDescription} />
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


export default SubmissionDetailsPage;