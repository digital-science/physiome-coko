import Dashboard from "./components/dashboard";
import { registerFormFieldType } from 'component-task-form/client/components/registry';

import FormFieldSubmissionStatus from './components/form-field-submission-status';
import FormFieldClaimSubmission from './components/form-field-claim-submission';

let hasSetup = false;
if(!hasSetup) {
    registerFormFieldType('SubmissionStatusPill', FormFieldSubmissionStatus);
    registerFormFieldType('ClaimSubmission', FormFieldClaimSubmission);
}

export { Dashboard };


