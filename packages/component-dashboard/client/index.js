import DashboardActive from "./components/dashboard-active";
import DashboardPublished from "./components/dashboard-published";

import { registerFormFieldType } from 'component-task-form/client/components/registry';

import FormFieldSubmissionStatus from './components/form-field-submission-status';
import FormFieldClaimSubmission from './components/form-field-claim-submission';
import FormFieldResumeRejectedSubmission from './components/form-field-resume-rejected-submission';
import FormFieldRepublishSubmission from './components/form-field-republish-submission';

let hasSetup = false;
if(!hasSetup) {
    registerFormFieldType('SubmissionStatusPill', FormFieldSubmissionStatus);
    registerFormFieldType('ClaimSubmission', FormFieldClaimSubmission);
    registerFormFieldType('ResumeRejectedSubmission', FormFieldResumeRejectedSubmission);
    registerFormFieldType('RepublishSubmission', FormFieldRepublishSubmission);
}

export { DashboardActive, DashboardPublished };


