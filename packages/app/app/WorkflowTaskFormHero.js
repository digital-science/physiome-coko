import React, { useContext } from 'react';
import { WorkflowDescriptionContext } from 'client-workflow-model'
import { taskFormForFormDefinition } from 'component-task-form/client'
import styled from 'styled-components';


function WorkflowTaskFormHero({ match, history }) {

    const { instanceId, taskId, taskName, type } = match.params;
    const WorkflowDescription = useContext(WorkflowDescriptionContext);

    const instanceType = WorkflowDescription.findInstanceTypeForUrlName(type);
    if(!instanceType) {
        throw new Error(`Unable to find task definition for type '${type}'.`);
    }

    const formDefinition = instanceType.formDefinitionForFormName(taskName);
    const TaskFormType = taskFormForFormDefinition(formDefinition);

    const wasSubmitted = () => {
        history.push("/");
    };

    const heading = formDefinition && formDefinition.options ? formDefinition.options.heading : null;

    return (
        <WorkflowTaskFormHeroHolder>
            {heading ? <WorkflowHeroHeading>{heading}</WorkflowHeroHeading> : null}
            <TaskFormType instanceId={instanceId} instanceType={instanceType} taskId={taskId} taskName={taskName}
                formDefinition={formDefinition} workflowDescription={WorkflowDescription}
                wasSubmitted={wasSubmitted}>
            </TaskFormType>
        </WorkflowTaskFormHeroHolder>
    );
}


const WorkflowTaskFormHeroHolder = styled.div`
  padding: 20px;
  background: white;
`;

const WorkflowHeroHeading = styled.div`

  border-top: 2px solid #ebebeb;

  font-family: NovcentoSansWideNormal, sans-serif;
  text-transform: uppercase;
  text-align: center;
  font-size: 32px;
  font-weight: bold;
  letter-spacing: 0.1em;
  color: #828282;
  
  /*background: #ebebeb;*/
  margin: -20px -20px 20px;
  padding: 20px;
  
`;


export default WorkflowTaskFormHero;

