import React, { useContext, useState } from 'react';
import styled from 'styled-components';

import { Checkbox, CheckboxLabel } from "ds-theme/components/checkbox-input";

import { WorkflowDescriptionContext } from 'client-workflow-model';
import SubmissionListing from './submission-listing';
import SubmissionListingHeader, { HeaderHolder } from './submission-listing-header';

import useCreateTaskMutation from './../mutations/createTask';


// FIXME: we only want "Saved" active phases for the current user!!

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


const AssignNewButton = styled.button`
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


const _DashboardActiveSubmissions = ({className, history, children}) => {

    const workflowDescription = useContext(WorkflowDescriptionContext);
    const submissionInstanceType = workflowDescription.findInstanceType('Submission');
    const createNewTask = useCreateTaskMutation(submissionInstanceType.name);

    const [phases, setPhases] = useState(ActivePhases.slice(0));
    const [searchText, setSearchText] = useState("");
    const [showOnHoldSubmissions, setShowOnHoldSubmissions] = useState(false);


    function handleCreateNewSubmission() {
        createNewTask().then(data => {
            const { id } = data;
            history.push(`/submission/${id}`);
        });
    }

    const setFilteredPhases = (newPhases) => {
        setPhases(newPhases);
    };

    const searchTextDidChange = (text) => {
        setSearchText(text);
    };

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
            <div className="on-hold-section">
                <CheckboxLabel><Checkbox checked={showOnHoldSubmissions} onChange={handleOnChangeOnHoldSubmissions} />On-hold</CheckboxLabel>
            </div>
        );
    };

    const renderHeading = ({header}) => {
        return (
            <HeaderHolder>
                {header}
                <SubmissionListingHeader showFilter={true} setFilteredPhases={setFilteredPhases} searchTextDidChange={searchTextDidChange}
                    allFilterPhases={AllPhases} defaultActiveFilterPhases={ActivePhases} renderAdditionalFilters={renderAdditionalFilters} />
            </HeaderHolder>
        );
    };


    return (
        <div className={className}>
            <SubmissionListing heading="Active Submissions" renderHeading={renderHeading} phases={phases}
                searchText={searchText} showOnHoldSubmissions={showOnHoldSubmissions}>

                <AssignNewButton onClick={handleCreateNewSubmission}>
                    <span>+</span>Create New Submission&hellip;
                </AssignNewButton>

                {children}

            </SubmissionListing>
        </div>
    );
};

const DashboardActiveSubmissions = styled(_DashboardActiveSubmissions)`
  padding: 32px;
`;

export default DashboardActiveSubmissions;