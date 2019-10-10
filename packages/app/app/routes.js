import React from 'react';
import { Route, Switch } from 'react-router';

import SubmissionApp from './SubmissionApp';

import LoginRequiredRoute from 'component-authentication/client/LoginRequiredRoute';

import {
    PageDashboardActiveSubmissions,
    PageDashboardPublishedSubmissions,
    PageDashboardRejectedSubmissions,
    PageDashboardSubmitterSubmissions,
    PageSubmissionForm,
    PageSubmissionDetails
} from 'physiome-ui/client';



const renderAppDefault = (children, currentUser, props={}) => <SubmissionApp {...props}>{children}</SubmissionApp>;
const renderAppHideSidebar = (children, currentUser, props={}) => <SubmissionApp hideSidebar={true} {...props}>{children}</SubmissionApp>;

const Routes = () => (

    <Switch>

        <Route path="/submission/:instanceId" render={props=> {
            return (
                <LoginRequiredRoute message="You must login before being able to finish submitting details of your in-progress submission. Login using your ORCID credentials." renderApplication={renderAppHideSidebar}
                    renderContent={children => <PageSubmissionForm children={children} {...props} />} />
            );
        }} />

        <Route path="/details/:instanceId" render={props=> {

            const renderAppDetails = (children, currentUser, p = {}) => {
                if(currentUser.groups && currentUser.groups.indexOf("administrator") !== -1) {
                    return renderAppDefault(children, currentUser, p);
                }
                return renderAppHideSidebar(children, currentUser, p);
            };

            return (
                <LoginRequiredRoute message="You must login to be able to view details of the requested submission. Login using your ORCID credentials." renderApplication={renderAppDetails}
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

            const renderMainDashboard = (children, currentUser) => {

                if(currentUser.groups && currentUser.groups.indexOf("administrator") !== -1) {
                    return (
                        <SubmissionApp>
                            <PageDashboardActiveSubmissions history={props.history} />
                        </SubmissionApp>
                    );
                }

                return (
                    <SubmissionApp hideSidebar={true}>
                        <PageDashboardSubmitterSubmissions history={props.history} />
                    </SubmissionApp>
                );
            };

            return <LoginRequiredRoute message="To start a new submission please login using your ORCID ID." renderApplication={renderMainDashboard} />;
        }} />

    </Switch>
);

export default Routes
