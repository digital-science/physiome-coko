import { registerFormFieldType } from 'component-task-form/client/components/registry';

import FormFieldSubmissionStatus from './form-fields/form-field-submission-status';
import FormFieldClaimSubmission from './form-fields/form-field-claim-submission';
import FormFieldResumeRejectedSubmission from './form-fields/form-field-resume-rejected-submission';
import FormFieldRepublishSubmission from './form-fields/form-field-republish-submission';
import FormFieldRequestPaymentBanner from './form-fields/form-field-request-payment-banner';

registerFormFieldType('SubmissionStatusPill', FormFieldSubmissionStatus);
registerFormFieldType('ClaimSubmission', FormFieldClaimSubmission);
registerFormFieldType('ResumeRejectedSubmission', FormFieldResumeRejectedSubmission);
registerFormFieldType('RepublishSubmission', FormFieldRepublishSubmission);
registerFormFieldType('RequestPaymentBanner', FormFieldRequestPaymentBanner);


import PageDashboardActiveSubmissions from './pages/dashboard-active-submissions';
import PageDashboardPublishedSubmissions from './pages/dashboard-published-submissions';
import PageDashboardRejectedSubmissions from './pages/dashboard-rejected-submissions';

import PageSubmissionForm from './pages/submission-form';
import PageSubmissionDetails from './pages/submission-details';

export {
    PageDashboardActiveSubmissions,
    PageDashboardPublishedSubmissions,
    PageDashboardRejectedSubmissions,

    PageSubmissionForm,
    PageSubmissionDetails
};