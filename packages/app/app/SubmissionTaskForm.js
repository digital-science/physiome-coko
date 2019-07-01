import React from 'react';
import WorkflowTaskFormHero from './WorkflowTaskFormHero';

function SubmissionTaskForm({ match, history, children }) {

    // Hard-code the task and task name

    const type = 'submission';
    const taskName = 'submission';

    match.params.type = type;
    match.params.taskName = taskName;

    return <WorkflowTaskFormHero match={match} history={history} children={children} />;
}

export default SubmissionTaskForm;