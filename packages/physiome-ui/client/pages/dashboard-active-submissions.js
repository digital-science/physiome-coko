import React, { useContext, useState, useMemo } from 'react';
import styled from 'styled-components';

import { WorkflowDescriptionContext } from 'client-workflow-model';
import useCreateSubmissionMutation from "../mutations/createSubmission";

import { Checkbox, CheckboxLabel } from "ds-theme/components/checkbox-input";
import SubmissionsListing from '../listings/submissions-listing';


const AllPhases = [
    "Saved",
    "Submitted",
    "Decision",
    "Payment",
    "Paid"
];

const ActivePhases = [
    "Saved",
    "Submitted",
    "Decision",
    "Payment",
    "Paid"
];


const CretaeNewSubmissionButton = styled.button`
    display: inline-block;
    height: 30px;
    
    font-size: 17px;
    line-height: 30px;
    border: none;
    background: none;
    font-family: NovcentoSansWideNormal, sans-serif;
    text-transform: uppercase;
    
    cursor: pointer;

    > span {
        display: inline-block;
        font-size: 30px;
        color: #3779a0;
    }
`;

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

                <CretaeNewSubmissionButton onClick={handleCreateNewSubmission}>
                    <span>+</span>Create New Submission&hellip;
                </CretaeNewSubmissionButton>

                {children}

            </SubmissionsListing>

        </div>
    );
};

const DashboardActiveSubmissions = styled(_DashboardActiveSubmissions)`
`;

export default DashboardActiveSubmissions;


