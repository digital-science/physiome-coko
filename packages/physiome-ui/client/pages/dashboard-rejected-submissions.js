import React from 'react';
import styled from 'styled-components';
import SubmissionsListing from '../listings/submissions-listing';


const RejectedSubmissionsPhases = [
    "Reject"
];

const _DashboardRejectedSubmissions = ({className, history, children}) => {

    return (
        <div className={className}>
            <SubmissionsListing history={history} heading='Rejected Submissions' showFilter={false} allFilterPhases={RejectedSubmissionsPhases} defaultActiveFilterPhases={RejectedSubmissionsPhases}>
                {children}
            </SubmissionsListing>
        </div>
    );
};

const DashboardRejectedSubmissions = styled(_DashboardRejectedSubmissions)`
`;

export default DashboardRejectedSubmissions;


