import React, { useContext, useState, useMemo } from 'react';
import styled from 'styled-components';

import { WorkflowDescriptionContext } from 'client-workflow-model';
import useCreateSubmissionMutation from "../mutations/createSubmission";

import { Checkbox, CheckboxLabel } from "ds-theme/components/checkbox-input";
import SubmissionsListing from '../listings/submissions-listing';
import { PrimaryInlineButton } from "ds-theme/components/inline-button";

import { FaPlus } from 'react-icons/fa';


const AllPhases = [
    "Saved",
    "Submitted",
    "Decision",
    "Payment",
    "Paid",
    "SkipPayment"
];

const ActivePhases = [
    //"Saved",
    "Submitted",
    "Decision",
    "Payment",
    "Paid",
    "SkipPayment"
];


const SubmissionListingAdditionalSectionHolder = styled.div`
    margin-top: 10px;
    padding-top: 5px;
    border-top: 1px solid #b9b9b9;
`;



const _DashboardActiveSubmissions = ({className, history, children}) => {

    const workflowDescription = useContext(WorkflowDescriptionContext);
    const submissionInstanceType = useMemo(() => workflowDescription.findInstanceType('Submission'), [workflowDescription]);
    const createNewSubmission = useCreateSubmissionMutation(submissionInstanceType);

    const [showOnHoldSubmissions, setShowOnHoldSubmissions] = useState(false);


    function handleCreateNewSubmission() {
        createNewSubmission().then(data => {
            const { id } = data;
            history.push(`/submission/${id}`);
        });
    }

    const renderAdditionalFilters = (saveCurrentFilters, restoreSavedFilters, deactivateAllFilters) => {

        const handleOnChangeOnHoldSubmissions = (e) => {
            if(e.target.checked) {
                saveCurrentFilters();
                deactivateAllFilters();
            } else {
                restoreSavedFilters();
            }
            setShowOnHoldSubmissions(e.target.checked);
        };

        return (
            <SubmissionListingAdditionalSectionHolder>
                <CheckboxLabel><Checkbox checked={showOnHoldSubmissions} onChange={handleOnChangeOnHoldSubmissions} />On-hold</CheckboxLabel>
            </SubmissionListingAdditionalSectionHolder>
        );
    };

    return (
        <div className={className}>

            <SubmissionsListing history={history} heading='Active Submissions' allFilterPhases={AllPhases} defaultActiveFilterPhases={ActivePhases}
                showOnHoldSubmissions={showOnHoldSubmissions} renderAdditionalFilters={renderAdditionalFilters}>

                <PrimaryInlineButton icon={<FaPlus />} bordered={true} onClick={handleCreateNewSubmission}>
                    Create New Submission
                </PrimaryInlineButton>

                {children}

            </SubmissionsListing>

        </div>
    );
};

const DashboardActiveSubmissions = styled(_DashboardActiveSubmissions)`
`;

export default DashboardActiveSubmissions;


