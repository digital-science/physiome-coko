import React from 'react';
import styled from 'styled-components';

import SubmissionListing from './submission-listing';

const PublishedPhases = [
    "Publish",
    "Published"
];

const _DashboardPublishedSubmissions = ({className, history, children}) => {

    return (
        <div className={className}>
            <SubmissionListing heading="Published Submissions" children={children} phases={PublishedPhases} />
        </div>
    );
};

const DashboardPublishedSubmissions = styled(_DashboardPublishedSubmissions)`
  padding: 32px;
`;

export default DashboardPublishedSubmissions;