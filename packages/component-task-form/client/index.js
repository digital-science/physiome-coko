import TaskForm from './components/task-form';
import MultipleStageTaskForm from './components/multiple-stage-task-form';
import SideBySideHeroTaskForm from './components/side-by-side-hero-task-form';

import withFormField, { fetchFields, mergeFetchFields } from './components/fields/withFormField';
import withFormFieldData from './components/fields/withFormFieldData';

import useTimedMinimumDisplay from './hooks/useTimedMinimumDisplay';
import useFormValueBinding from './hooks/useFormValueBinding';

export { withFormField, fetchFields, mergeFetchFields, withFormFieldData }

export { useTimedMinimumDisplay, useFormValueBinding }

export { TaskForm, MultipleStageTaskForm, SideBySideHeroTaskForm  };


/* Return the "taskForm" for the provided form definition.  */
const TaskFormMap = {
    'MulitpleStages': MultipleStageTaskForm,
    'SideBySideHeroPanels': SideBySideHeroTaskForm,
    'Simple': TaskForm
};

function taskFormForFormDefinition(formDefinition) {

    return ((formDefinition && formDefinition.extends) ? TaskFormMap[formDefinition.extends] : TaskForm) || TaskForm;
}



import InstanceView from './components/instance-view';
import SideBySideHeroInstanceView from './components/side-by-side-hero-instance-view';
import MasterDetailEditor from './components/master-detail-editor';
import MasterDetailView from './components/master-detail-view';

const InstanceViewTypeMap = {
    'SideBySideHeroPanels': SideBySideHeroInstanceView,
    'MasterDetailEditor': MasterDetailEditor,
    'MasterDetailView': MasterDetailView,
    'Simple': InstanceView
};

function instanceViewTypeForViewDefinition(viewDefinition) {

    return ((viewDefinition && viewDefinition.extends) ? InstanceViewTypeMap[viewDefinition.extends] : InstanceView) || InstanceView;
}




export { taskFormForFormDefinition, instanceViewTypeForViewDefinition }