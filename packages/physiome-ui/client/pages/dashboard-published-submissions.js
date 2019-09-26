import React from 'react';
import styled from 'styled-components';
import SubmissionsListing from '../listings/submissions-listing';


const PublishedSubmissionsPhases = [
    "Publish",
    "Published"
];

const _DashboardPublishedSubmissions = ({className, history, children}) => {

    return (
        <div className={className}>
            <SubmissionsListing history={history} heading='Published Submissions' showFilter={false} allFilterPhases={PublishedSubmissionsPhases} defaultActiveFilterPhases={PublishedSubmissionsPhases}>
                {children}
            </SubmissionsListing>
        </div>
    );
};

const DashboardPublishedSubmissions = styled(_DashboardPublishedSubmissions)`
`;

export default DashboardPublishedSubmissions;


