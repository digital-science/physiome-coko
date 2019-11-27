import React from 'react';
import PageSubmissionForm from './submission-form';

const SubmissionRevisionDefaultTaskName = 'revisions';

function PageSubmissionRevisionForm({ submissionTaskName= SubmissionRevisionDefaultTaskName, ...props }) {

    //submission-revision

    return <PageSubmissionForm submissionTaskName={submissionTaskName} {...props} />;
}

export default PageSubmissionRevisionForm;