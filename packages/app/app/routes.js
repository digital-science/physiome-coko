import React from 'react';
import { Route, Switch } from 'react-router';

import SubmissionApp from './SubmissionApp';
import Index from './Index';
import WorkflowTaskFormModal from './WorkflowTaskFormModal';
import SubmissionTaskForm from './SubmissionTaskForm';
import SubmissionDetailsPage from './SubmissionDetails';


const Routes = () => (

    <Switch>
        <Route path="/submission/:instanceId" render={props=> {
            return (
                <SubmissionApp hideSidebar={true}>
                    <SubmissionTaskForm {...props} />
                </SubmissionApp>
            )
        }} />

        <Route path="/details/:instanceId" render={props=> {
            return (
                <SubmissionApp>
                    <SubmissionDetailsPage {...props} />
                </SubmissionApp>
            )
        }} />

        <Route path="/" render={props => {
            return (
                <SubmissionApp>
                    <Index history={props.history} />
                    <Route component={WorkflowTaskFormModal} path="/task/:type/:instanceId/:taskName/:taskId" />
                </SubmissionApp>
            );
        }} />

    </Switch>
);

export default Routes
