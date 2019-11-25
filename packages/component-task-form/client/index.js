import withFormField, { fetchFields, complexFetchFields, mergeFetchFields } from './components/fields/withFormField';
import withFormFieldData from './components/fields/withFormFieldData';
import useFormValidation from "./hooks/useFormValidation";

import useTimedMinimumDisplay from './hooks/useTimedMinimumDisplay';
import useFormValueBinding, { useFormValueBindingForComplexObject } from './hooks/useFormValueBinding';

export { withFormField, fetchFields, complexFetchFields, mergeFetchFields, withFormFieldData }
export { useTimedMinimumDisplay, useFormValueBinding, useFormValueBindingForComplexObject, useFormValidation }


import TaskForm from './components/task-form';
import MultipleStageTaskForm from './components/multiple-stage-task-form';
import SimplePanelTaskForm from './components/simple-panel-task-form';

export { TaskForm, MultipleStageTaskForm, SimplePanelTaskForm  };


/* Return the "taskForm" for the provided form definition.  */
const TaskFormMap = {
    'MulitpleStages': MultipleStageTaskForm,
    'SimplePanels': SimplePanelTaskForm,
    'Simple': TaskForm
};

function taskFormForFormDefinition(formDefinition) {

    return ((formDefinition && formDefinition.extends) ? TaskFormMap[formDefinition.extends] : TaskForm) || TaskForm;
}



import InstanceView from './components/instance-view';
import SimplePanelInstanceView from './components/simple-panel-instance-view';
import MasterDetailEditor from './components/master-detail-editor';
import MasterDetailView from './components/master-detail-view';

const InstanceViewTypeMap = {
    'MasterDetailEditor': MasterDetailEditor,
    'MasterDetailView': MasterDetailView,
    'SimplePanels': SimplePanelInstanceView,
    'Simple': InstanceView
};

function instanceViewTypeForViewDefinition(viewDefinition) {

    return ((viewDefinition && viewDefinition.extends) ? InstanceViewTypeMap[viewDefinition.extends] : InstanceView) || InstanceView;
}

export { taskFormForFormDefinition, instanceViewTypeForViewDefinition }



import WorkflowTaskForm from "./components/workflow-task-form";
export { WorkflowTaskForm }



import { registerConditionFunction } from 'client-workflow-model';
import { correspondingAuthors, singleCorrespondingAuthor, validCitations, validIdentity, validUri, fileCount } from '../shared/validations';

registerConditionFunction('correspondingAuthors', correspondingAuthors);
registerConditionFunction('singleCorrespondingAuthor', singleCorrespondingAuthor);
registerConditionFunction('validCitations', validCitations);
registerConditionFunction('validIdentity', validIdentity);
registerConditionFunction('validUri', validUri);
registerConditionFunction('fileCount', fileCount);

