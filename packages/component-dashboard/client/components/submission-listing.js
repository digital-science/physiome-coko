import React, { useContext, useMemo } from 'react';
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

const _SubmissionListing = ({className, history, children, heading, renderHeading=null, phases}) => {

    const workflowDescription = useContext(WorkflowDescriptionContext);
    const submissionInstanceType = workflowDescription.findInstanceType('Submission');

    const filter = useMemo(() => {

        return {
            phase: (phases || DefaultPhases).slice(0)
        };

    },[phases]);

    const sorting = { submissionDate: false };

    const { data, error, loading, refetch } = useGetSubmissions(filter, sorting);
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

    const header = <SubmissionListingHeader>{heading}</SubmissionListingHeader>;

    return (
        <div className={className}>

            {renderHeading ? renderHeading({header, heading}) : header}

            <SubmissionTable submissionInstanceType={submissionInstanceType} loading={loading} error={error}
                submissions={data ? data.submissions : null} refreshSubmissions={refreshSubmissions} />

            {children}
        </div>
    );
};


const SubmissionListing = styled(_SubmissionListing)`
`;

export default SubmissionListing;