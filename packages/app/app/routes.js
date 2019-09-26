import React from 'react';
import { Route, Switch } from 'react-router';

import SubmissionApp from './SubmissionApp';

import LoginRequiredRoute from 'component-authentication/client/LoginRequiredRoute';

import {
    PageDashboardActiveSubmissions,
    PageDashboardPublishedSubmissions,
    PageDashboardRejectedSubmissions,
    PageSubmissionForm,
    PageSubmissionDetails
} from 'physiome-ui/client';



const renderAppDefault = (children, props={}) => <SubmissionApp {...props}>{children}</SubmissionApp>;
const renderAppHideSidebar = (children, props={}) => <SubmissionApp hideSidebar={true} {...props}>{children}</SubmissionApp>;

const Routes = () => (

    <Switch>
        <Route path="/submission/:instanceId" render={props=> {
            return (
                <LoginRequiredRoute message="You must login before being able to finish submitting details of your in-progress submission. Login using your ORCID credentials." renderApplication={renderAppHideSidebar}
                    renderContent={children => <PageSubmissionForm children={children} {...props} />} />
            );
        }} />

        <Route path="/details/:instanceId" render={props=> {
            return (
                <LoginRequiredRoute message="You must login to be able to view details of the requested submission. Login using your ORCID credentials." renderApplication={renderAppDefault}
                    renderContent={children => <PageSubmissionDetails children={children} {...props} />} />
            );
        }} />

        <Route path="/published" render={props => {
            return (
                <LoginRequiredRoute message="To start a new submission please login using your ORCID ID." renderApplication={renderAppDefault}>
                    <PageDashboardPublishedSubmissions history={props.history} />
                </LoginRequiredRoute>
            );
        }} />

        <Route path="/rejected" render={props => {
            return (
                <LoginRequiredRoute message="To start a new submission please login using your ORCID ID." renderApplication={renderAppDefault}>
                    <PageDashboardRejectedSubmissions history={props.history} />
                </LoginRequiredRoute>
            );
        }} />

        <Route path="/" render={props => {
            return (
                <LoginRequiredRoute message="To start a new submission please login using your ORCID ID." renderApplication={renderAppDefault}>
                    <PageDashboardActiveSubmissions history={props.history} />
                </LoginRequiredRoute>
            );
        }} />

    </Switch>
);

export default Routes
