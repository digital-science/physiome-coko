import React, { useContext } from 'react';
import { WorkflowDescriptionContext } from 'client-workflow-model'
import { taskFormForFormDefinition } from 'component-task-form/client'
import styled from 'styled-components';


function WorkflowTaskFormHero({ match, history, children }) {

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
        return Promise.resolve();
    };

    const heading = formDefinition && formDefinition.options ? formDefinition.options.heading : null;

    return (
        <WorkflowTaskFormHeroHolder>
            <WorkflowHeroPageHeadingHolder className="message-holder">
                {children}
            </WorkflowHeroPageHeadingHolder>
            <WorkflowHeroPageHeadingHolder>
                {heading ? <WorkflowHeroHeading>{heading}</WorkflowHeroHeading> : null}
            </WorkflowHeroPageHeadingHolder>

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
  min-height: calc(100vh - 68px);
  box-sizing: border-box;
  
  & > ${WorkflowTaskFormHeroHolder}:first-child {
      border-top: 2px solid #ebebeb;
  }
`;

const WorkflowHeroHeading = styled.div`

  font-family: NovcentoSansWideNormal, sans-serif;
  text-transform: uppercase;
  text-align: center;
  font-size: 28px;
  color: #828282;
  
  /*background: #ebebeb;*/
  padding: 20px;
`;

const WorkflowHeroPageHeadingHolder = styled.div`
  margin: -20px -20px 20px;
  
  &.message-holder {
    position: sticky;
    top: 0;
    z-index: 2;
  }
`;


export default WorkflowTaskFormHero;

