import React, { useState } from 'react';
import styled from 'styled-components';

import SubmissionListing from './submission-listing';
import SubmissionListingHeader, { HeaderHolder } from './submission-listing-header';

const RejectedPhases = [
    "Reject"
];

const _DashboardRejectedSubmissions = ({className, history, children}) => {

    const [searchText, setSearchText] = useState("");

    const searchTextDidChange = (text) => {
        setSearchText(text);
    };

    const renderHeading = ({header}) => {
        return (
            <HeaderHolder>
                {header}
                <SubmissionListingHeader showFilter={false} searchTextDidChange={searchTextDidChange} />
            </HeaderHolder>
        );
    };

    return (
        <div className={className}>
            <SubmissionListing heading="Rejected Submissions" children={children} phases={RejectedPhases}
                renderHeading={renderHeading} searchText={searchText} />
        </div>
    );
};

const DashboardRejectedSubmissions = styled(_DashboardRejectedSubmissions)`
  padding: 32px;
`;

export default DashboardRejectedSubmissions;