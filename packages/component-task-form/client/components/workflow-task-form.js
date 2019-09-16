import React, { useContext } from 'react';
import { WorkflowDescriptionContext } from 'client-workflow-model'
import { taskFormForFormDefinition } from 'component-task-form/client'
import styled from 'styled-components';


function WorkflowTaskForm({ match, history, children, wasSubmitted, renderNoTask = null }) {

    const { instanceId, taskId, taskName, type } = match.params;
    const WorkflowDescription = useContext(WorkflowDescriptionContext);

    const instanceType = WorkflowDescription.findInstanceTypeForUrlName(type);
    if(!instanceType) {
        throw new Error(`Unable to find task definition for type '${type}'.`);
    }

    const formDefinition = instanceType.formDefinitionForFormName(taskName);
    const TaskFormType = taskFormForFormDefinition(formDefinition);

    const heading = formDefinition && formDefinition.options ? formDefinition.options.heading : null;

    const basicWasSubmitted = () => {
        history.push("/");
        return Promise.resolve();
    };

    return (
        <WorkflowTaskFormHolder>
            <HeadingHolder className="message-holder">
                {children}
            </HeadingHolder>
            <HeadingHolder>
                {heading ? <Heading>{heading}</Heading> : null}
            </HeadingHolder>

            <TaskFormType className='task-form' instanceId={instanceId} instanceType={instanceType} taskId={taskId} taskName={taskName}
                formDefinition={formDefinition} workflowDescription={WorkflowDescription}
                wasSubmitted={wasSubmitted || basicWasSubmitted} renderNoTask={renderNoTask}>
            </TaskFormType>
        </WorkflowTaskFormHolder>
    );
}




const WorkflowTaskFormHolder = styled.div`
  
  padding: 20px;
  background: white;
  min-height: calc(100vh - 68px);
  box-sizing: border-box;
  
  display: flex;
  flex-direction: column;
  
  & > ${WorkflowTaskFormHolder}:first-child {
      border-top: 2px solid #ebebeb;
  }
  
  & > .task-form {
    flex-grow: 1;
  }
`;

const Heading = styled.div`

  font-family: NovcentoSansWideNormal, sans-serif;
  text-transform: uppercase;
  text-align: center;
  font-size: 28px;
  color: #828282;
  
  /*background: #ebebeb;*/
  padding: 20px;
`;

const HeadingHolder = styled.div`
  margin: -20px -20px 20px;
  
  &.message-holder {
    position: sticky;
    top: 0;
    z-index: 2;
  }
`;


export default WorkflowTaskForm;
export { WorkflowTaskFormHolder };