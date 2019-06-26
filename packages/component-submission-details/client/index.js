import SubmissionDetails from './components/submission-details';

import { registerFormFieldType } from 'component-task-form/client/components/registry';

import FormFieldRequestPaymentBanner from './components/form-field-request-payment-banner';

let hasSetup = false;
if(!hasSetup) {
    registerFormFieldType('RequestPaymentBanner', FormFieldRequestPaymentBanner);
}


export default SubmissionDetails;
export { SubmissionDetails };