import React from 'react';
import { Route, Switch } from 'react-router';

import SubmissionApp from './SubmissionApp';
import LogoutRoute from "./Logout";

import LoginRequiredRoute from 'component-authentication/client/LoginRequiredRoute';

import {
    PageDashboardActiveSubmissions,
    PageDashboardPublishedSubmissions,
    PageDashboardRejectedSubmissions,
    PageDashboardSubmitterSubmissions,
    PageSubmissionForm,
    PageSubmissionRevisionForm,
    PageSubmissionDetails
} from 'physiome-ui/client';



const renderAppWithSidebar = (children, currentUser, props={}) => <SubmissionApp {...props}>{children}</SubmissionApp>;
const renderAppHideSidebar = (children, currentUser, props={}) => <SubmissionApp hideSidebar={true} {...props}>{children}</SubmissionApp>;

function _userIsAdmin(user) {
    return (user && user.groups && user.groups.indexOf("administrator") !== -1);
}

const renderAppDefault = (children, currentUser, p) => {
    const isAdmin = _userIsAdmin(currentUser);
    return isAdmin ? renderAppWithSidebar(children, currentUser, p) : renderAppHideSidebar(children, currentUser, p);
};


const Routes = () => (

    <Switch>

        <Route path="/submission/:instanceId" render={props=> {
            return (
                <LoginRequiredRoute message="You must login before being able to finish submitting details of your in-progress submission. Login using your ORCID credentials."
                    renderApplication={renderAppHideSidebar} renderContent={children => <PageSubmissionForm children={children} {...props} />} />
            );
        }} />

        <Route path="/revisions/:instanceId" render={props=> {
            return (
                <LoginRequiredRoute message="You must login before being able to submit revisions to your in-progress submission. Login using your ORCID credentials."
                    renderApplication={renderAppHideSidebar} renderContent={children => <PageSubmissionRevisionForm children={children} {...props} />} />
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

        <Route path="/logout" render={props => {
            return <LogoutRoute history={props.history} />
        }} />

        <Route path="/" render={props => {

            const renderContent = (loginContent, currentUser) => {
                const isAdmin = _userIsAdmin(currentUser);
                const page = isAdmin ? <PageDashboardActiveSubmissions history={props.history} /> : <PageDashboardSubmitterSubmissions history={props.history} />;

                return (
                    <React.Fragment>
                        {loginContent || null}
                        {page}
                    </React.Fragment>
                );
            };

            return (
                <LoginRequiredRoute message="To start a new submission please login using your ORCID ID."
                    renderApplication={renderAppDefault} renderContent={renderContent} />
            );
        }} />

    </Switch>
);

export default Routes
