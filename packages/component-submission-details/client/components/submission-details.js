import React from 'react';
import { instanceViewTypeForViewDefinition } from 'component-task-form/client'
import styled from 'styled-components';


function SubmissionDetails({instanceId, instanceType, viewDefinition, workflowDescription, children}) {

    const InstanceViewType = instanceViewTypeForViewDefinition(viewDefinition);
    if(!InstanceViewType) {
        throw new Error("Unable to find task view type for view definition.");
    }

    const instanceViewProps = {instanceId, instanceType, viewDefinition, workflowDescription, children};

    return (
        <SubmissionDetailsHolder>
            <InstanceViewType {...instanceViewProps}  />
        </SubmissionDetailsHolder>
    );
}

const SubmissionDetailsHolder = styled.div`
  
`;

export default SubmissionDetails;