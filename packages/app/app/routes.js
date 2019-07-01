import React from 'react';
import { Route, Switch } from 'react-router';

import SubmissionApp from './SubmissionApp';
import Index from './Index';
import SubmissionTaskForm from './SubmissionTaskForm';
import SubmissionDetailsPage from './SubmissionDetails';

import LoginRequiredRoute from 'component-authentication/client/LoginRequiredRoute';


const renderAppDefault = (children) => <SubmissionApp>{children}</SubmissionApp>;
const renderAppHideSidebar = (children) => <SubmissionApp hideSidebar={true}>{children}</SubmissionApp>;

const Routes = () => (

    <Switch>
        <Route path="/submission/:instanceId" render={props=> {
            return (
                <LoginRequiredRoute message="You must login before being able to finish submitting details of your in-progress submission. Login using your ORCID credentials." renderApplication={renderAppHideSidebar}
                    renderContent={children => <SubmissionTaskForm children={children} {...props} />} />
            );
        }} />

        <Route path="/details/:instanceId" render={props=> {
            return (
                <LoginRequiredRoute message="You must login to be able to view details of the requested submission. Login using your ORCID credentials." renderApplication={renderAppDefault}
                    renderContent={children => <SubmissionDetailsPage children={children} {...props} />} />
            );
        }} />

        <Route path="/" render={props => {
            return (
                <LoginRequiredRoute message="To start a new submission please login using your ORCID ID." renderApplication={renderAppDefault}>
                    <Index history={props.history} />
                </LoginRequiredRoute>
            );
        }} />

    </Switch>
);

export default Routes
