import React from 'react';
import { Route, Switch } from 'react-router';

import SubmissionApp from './SubmissionApp';
import Index from './Index';
import SubmissionTaskForm from './SubmissionTaskForm';
import SubmissionDetailsPage from './SubmissionDetails';

import LoginRequiredRoute from './LoginRequiredRoute';


const Routes = () => (

    <Switch>
        <Route path="/submission/:instanceId" render={props=> {
            return (
                <SubmissionApp hideSidebar={true}>
                    <LoginRequiredRoute message="You must login before being able to finish submitting details of your in-progress submission. Login using your ORCID credentials.">
                        <SubmissionTaskForm {...props} />
                    </LoginRequiredRoute>
                </SubmissionApp>
            )
        }} />

        <Route path="/details/:instanceId" render={props=> {
            return (
                <SubmissionApp>
                    <LoginRequiredRoute message="You must login to be able to view details of the requested submission. Login using your ORCID credentials.">
                        <SubmissionDetailsPage {...props} />
                    </LoginRequiredRoute>
                </SubmissionApp>
            )
        }} />

        <Route path="/" render={props => {
            return (
                <SubmissionApp>
                    <LoginRequiredRoute message="To start a new submission please login using your ORCID ID.">
                        <Index history={props.history} />
                    </LoginRequiredRoute>
                </SubmissionApp>
            );
        }} />

    </Switch>
);

export default Routes
