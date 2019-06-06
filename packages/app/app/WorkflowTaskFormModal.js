import React, { useContext } from 'react';
import { WorkflowDescriptionContext } from 'client-workflow-model'
import { taskFormForFormDefinition } from 'component-task-form/client'
import ModalOverlay from 'component-overlay';


function WorkflowTaskFormModal({ match, history }) {

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

    const modalHeading = formDefinition && formDefinition.options ? formDefinition.options.heading : null;

    return (
        <ModalOverlay heading={modalHeading} isOpen={true} hasClose={true} close={wasSubmitted}>
            <TaskFormType instanceId={instanceId} instanceType={instanceType} taskId={taskId} taskName={taskName}
                formDefinition={formDefinition} workflowDescription={WorkflowDescription}
                wasSubmitted={wasSubmitted}>
            </TaskFormType>
        </ModalOverlay>
    );
}

export default WorkflowTaskFormModal;

