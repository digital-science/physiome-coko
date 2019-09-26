import React, { useContext } from 'react';
import { WorkflowDescriptionContext } from 'client-workflow-model'
import { taskFormForFormDefinition } from 'component-task-form/client'
import styled from 'styled-components';

const SubmissionDefaultType = 'submission';
const SubmissionDefaultTaskName = 'submission';


function PageSubmissionForm({ match, history, children }) {

    const { instanceId, taskId, taskName = SubmissionDefaultTaskName, type = SubmissionDefaultType } = match.params;
    const workflowDescription = useContext(WorkflowDescriptionContext);

    const instanceType = workflowDescription.findInstanceTypeForUrlName(type);
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
        <SubmissionFormHolder>
            <SubmissionFormPageHeadingHolder className="message-holder">
                {children}
            </SubmissionFormPageHeadingHolder>
            <SubmissionFormPageHeadingHolder>
                {heading ? <WorkflowHeroHeading>{heading}</WorkflowHeroHeading> : null}
            </SubmissionFormPageHeadingHolder>

            <TaskFormType instanceId={instanceId} instanceType={instanceType} taskId={taskId} taskName={taskName}
                formDefinition={formDefinition} workflowDescription={workflowDescription}
                wasSubmitted={wasSubmitted}>
            </TaskFormType>
        </SubmissionFormHolder>
    );
}




const SubmissionFormHolder = styled.div`
  padding: 20px;
  background: white;
  min-height: calc(100vh - 68px);
  box-sizing: border-box;
  
  & > ${SubmissionFormHolder}:first-child {
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

const SubmissionFormPageHeadingHolder = styled.div`
  margin: -20px -20px 20px;
  
  &.message-holder {
    position: sticky;
    top: 0;
    z-index: 2;
  }
`;


export default PageSubmissionForm;

