import Dashboard from "./components/dashboard";
import { registerFormFieldType } from 'component-task-form/client/components/registry';

import FormFieldSubmissionStatus from './components/form-field-submission-status';

let hasSetup = false;
if(!hasSetup) {
    registerFormFieldType('SubmissionStatusPill', FormFieldSubmissionStatus);
}

export { Dashboard };


