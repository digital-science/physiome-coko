import React, { useContext, useState, useCallback } from 'react';
import { Prompt } from 'react-router-dom';

import { WorkflowDescriptionContext } from 'client-workflow-model';
import { taskFormForFormDefinition } from 'component-task-form/client';

import { BasicMessage, BasicMessageButton } from 'component-overlay';
import styled from 'styled-components';

const SubmissionDefaultType = 'submission';
const SubmissionDefaultTaskName = 'submission';


function PageSubmissionForm({ match, history, children, submissionTaskName = SubmissionDefaultTaskName }) {

    const { instanceId, taskId, taskName = submissionTaskName, type = SubmissionDefaultType } = match.params;
    const workflowDescription = useContext(WorkflowDescriptionContext);

    const [didSubmit, setDidSubmit] = useState(false);
    const [showUnsubmittedSubmissionMessage, setShowUnsubmittedSubmissionMessage] = useState(false);
    const [prevLocation, setPreviousLocation] = useState(false);

    const instanceType = workflowDescription.findInstanceTypeForUrlName(type);
    if(!instanceType) {
        throw new Error(`Unable to find task definition for type '${type}'.`);
    }

    const formDefinition = instanceType.formDefinitionForFormName(taskName);
    const TaskFormType = taskFormForFormDefinition(formDefinition);

    const wasSubmitted = () => {
        setDidSubmit(true);
        setTimeout(() => {
            history.push("/");
        }, 0);
        return Promise.resolve();
    };

    const blockNavigation = useCallback((nextLocation) => {

        if(didSubmit) {
            return true;
        }

        setPreviousLocation(nextLocation);
        setShowUnsubmittedSubmissionMessage(true);
        return false;

    }, [didSubmit, setPreviousLocation]);

    const hideUnsubmittedSubmissionMessage = useCallback(() => {

        setPreviousLocation(null);
        setShowUnsubmittedSubmissionMessage(false);

    }, [setPreviousLocation, setShowUnsubmittedSubmissionMessage]);

    const discardUnsubmittedSubmission = useCallback(() => {

        setDidSubmit(true);
        setTimeout(() => {
            history.push(prevLocation);
        }, 0);

    }, [history, prevLocation, setDidSubmit]);


    const heading = formDefinition && formDefinition.options ? formDefinition.options.heading : null;

    return (
        <SubmissionFormHolder>

            <Prompt when={!didSubmit} message={blockNavigation} />
            <BasicMessage isOpen={showUnsubmittedSubmissionMessage} closeOverlay={hideUnsubmittedSubmissionMessage} heading="In-progress Submission"
                rawMessage={'Your in-progress submission has not been saved or submitted. Please click \'Continue\' to make further changes to your submission, submit or save the submission. Clicking \'Leave\' will navigate away from the submission discarding it.<br /><br />If you want to come back to this submission at a later date, click \'Continue\' and then select the \'Save for Later\' option at the bottom of the page.'}
                buttons={
                    <MessageButtonsHolder>
                        <BasicMessageButton onClick={discardUnsubmittedSubmission}>Leave</BasicMessageButton>
                        <BasicMessageButton onClick={hideUnsubmittedSubmissionMessage}>Continue</BasicMessageButton>
                    </MessageButtonsHolder>
                }
            />


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

const MessageButtonsHolder = styled.div`
  & > button {
    min-width: 6em;
  }
  & > button + button {
    margin-left: 10px;
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

