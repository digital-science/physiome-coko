import React, { useContext, useMemo, useState, useEffect } from 'react';
import styled from 'styled-components';
import debounce from 'lodash/debounce';

import { WorkflowDescriptionContext } from 'client-workflow-model';

import useGetSubmissions from './../queries/getSubmissions';
import { useSubmissionWasCreatedSubscription, useSubmissionWasModifiedSubscription } from './../subscriptions/submissionsChanged';

import SubmissionTable from './submission-table';


const SubmissionListingHeader = styled.div`
    font-size: 17px;
    font-family: NovcentoSansWideBook, sans-serif;
    text-transform: uppercase;
`;

const DefaultPhases = [
    "Pending",
    "Saved",
    "Submitted",
    "Decision",
    "Payment",
    "Paid",
    "Publish",
    "Reject",
    "Published"
];

const _SubmissionListing = ({className, children, heading, showOnHoldSubmissions=false, renderHeading=null, phases, searchText}) => {

    const workflowDescription = useContext(WorkflowDescriptionContext);
    const submissionInstanceType = workflowDescription.findInstanceType('Submission');
    const [page, setPage] = useState(0);
    const pageSize = 10;

    const filter = useMemo(() => {
        const r = {
            phase: (phases || DefaultPhases).slice(0)
        };

        if(showOnHoldSubmissions === true || showOnHoldSubmissions === false){
            r.hidden = showOnHoldSubmissions;
        }
        return r;
    },[phases, showOnHoldSubmissions]);

    useEffect(() => {
        setPage(0);
    }, [filter, searchText]);

    const sorting = { submissionDate: false };

    const { data, error, loading, refetch } = useGetSubmissions(pageSize, page * pageSize, filter, sorting, (searchText && searchText.length) ? searchText : null);
    const throttledRefetch = debounce(refetch, 2000, { leading: true, trailing: true, maxWait:2000 });

    useSubmissionWasCreatedSubscription(submissionId => {
        return throttledRefetch();
    });

    useSubmissionWasModifiedSubscription(submissionId => {
        return throttledRefetch();
    });

    const refreshSubmissions = () => {
        return throttledRefetch();
    };

    const changeDisplayedPage = (page) => {
        setPage(page - 1);
    };

    const header = <SubmissionListingHeader>{heading}</SubmissionListingHeader>;

    return (
        <div className={className}>

            {renderHeading ? renderHeading({header, heading}) : header}

            <SubmissionTable submissionInstanceType={submissionInstanceType} loading={loading} error={error} refreshSubmissions={refreshSubmissions}
                submissions={data && data.submissions ? data.submissions.results : null} pageInfo={data && data.submissions ? data.submissions.pageInfo : null}
                currentPage={page + 1} pageSize={pageSize} setPage={changeDisplayedPage}  />

            {children}

        </div>
    );
};


const SubmissionListing = styled(_SubmissionListing)`
`;

export default SubmissionListing;