import React, { useContext, useState, useEffect } from 'react';
import styled from 'styled-components';

import { WorkflowDescriptionContext } from 'client-workflow-model';

import useCreateTaskMutation from './../mutations/createTask';

import PopoverTrigger from "component-task-form/client/components/popover";
import SubmissionListing from './submission-listing';
import { FaFilter } from 'react-icons/fa';

import { Checkbox, CheckboxLabel } from "ds-awards-theme/components/checkbox-input";
import { SmallTextInput } from "ds-awards-theme/components/text-input";
import useDebouncedValue from "ds-awards-theme/hooks/useDebouncedValue";


// FIXME: we only want "Saved" active phases for the current user!!

const AllPhases = [
    "Saved",
    "Submitted",
    "Decision",
    "Payment",
    "Paid",
    //"Reject",
];


const ActivePhases = [
    "Saved",
    "Submitted",
    "Decision",
    "Payment",
    "Paid",
    //"Reject",
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

const HeaderHolder = styled.div`
  display: flex;
  flex-wrap: nowrap;
  align-items: center;
  justify-content: space-between;
`;

const FilterButton = styled.div`
    color: #505050;
    padding: 4px 4px 1px 4px;
    border: 1px solid #505050;
    border-radius: 4px;
    box-shadow: 1px 1px 2px #50505073;
    cursor: pointer;
    &:hover {
      color: #343434;
      background: #50505020;
    }
`;

const FilterCheckboxListing = styled.div`
  padding: 10px;
  & > div + div {
    margin-top: 5px;
  }
  
  & > div.on-hold-section {
    margin-top: 10px;
    padding-top: 5px;
    border-top: 1px solid #b9b9b9;
  }
`;

const FilteringHolder = styled.div`

  flex-basis: 20%;
  min-width: 10em;

  display: flex;
  flex-wrap: nowrap;
  
  > * + * {
    margin-left: 10px;
  }
`;



function savePhases(filterOptions) {
    const r = {};
    filterOptions.forEach(f => {
        r[f.filter] = f.active;
    });
    return r;
}

function applyPhases(filterOptions, savedState) {
    if(!savedState) {
        return;
    }

    filterOptions.forEach(f => {
        if(savedState.hasOwnProperty(f.filter)) {
            f.setActive(savedState[f.filter]);

        }
    });
}

function deactiveAllPhases(filterOptions) {
    filterOptions.forEach(f => {
        f.setActive(false);
    });
}


const _DashboardActiveSubmissions = ({className, history, children}) => {

    const workflowDescription = useContext(WorkflowDescriptionContext);
    const submissionInstanceType = workflowDescription.findInstanceType('Submission');
    const createNewTask = useCreateTaskMutation(submissionInstanceType.name);

    const [phases, setPhases] = useState(ActivePhases.slice(0));
    const [showOnHoldSubmissions, setShowOnHoldSubmissions] = useState(false);
    const [savedPhases, setSavedPhases] = useState(null);

    const [searchText, setSearchText] = useState("");
    const [debouncedSearchText] = useDebouncedValue(searchText, 300);


    function handleCreateNewSubmission() {
        createNewTask().then(data => {
            const { id } = data;
            history.push(`/submission/${id}`);
        });
    }

    const handleOnChangeOnHoldSubmissions = (e) => {
        if(e.target.checked) {
            setSavedPhases(savePhases(filterOptions));
            deactiveAllPhases(filterOptions);
        } else {
            applyPhases(filterOptions, savedPhases);
        }
        setShowOnHoldSubmissions(e.target.checked);
    };

    const handleOnChangeSearchText = (e) => {
        setSearchText(e.target.value || "");
    };

    const filterOptions = AllPhases.map(filter => {

        const [checked, setChecked] = useState(true);
        const handleOnChange = (e) => {
            setChecked(e.target.checked);
        };
        const checkbox = <CheckboxLabel><Checkbox checked={checked} onChange={handleOnChange} />{filter}</CheckboxLabel>;
        return {filter, active:checked, setActive:setChecked, checkbox};
    });

    useEffect(() => {

        if(showOnHoldSubmissions) {
            return;
        }

        const newPhases = [];
        filterOptions.forEach(f => {
            if(f.active) {
                newPhases.push(f.filter);
            }
        });
        setPhases(newPhases);

    }, [showOnHoldSubmissions, ...filterOptions.map(f => f.active)]);


    const renderHeading = ({header}) => {
        return (
            <HeaderHolder>
                {header}
                <FilteringHolder>
                    <SmallTextInput value={searchText} onChange={handleOnChangeSearchText} placeholder="Search submissions…" />

                    <PopoverTrigger placement="bottom" renderContent={() => {
                        return (
                            <FilterCheckboxListing>
                                {filterOptions.map((filter, index) => <div key={index}>{filter.checkbox}</div> )}
                                <div className="on-hold-section">
                                    <CheckboxLabel><Checkbox checked={showOnHoldSubmissions} onChange={handleOnChangeOnHoldSubmissions} />On-hold</CheckboxLabel>
                                </div>
                            </FilterCheckboxListing>
                        );
                    }}>
                        <FilterButton>
                            <FaFilter />
                        </FilterButton>
                    </PopoverTrigger>
                </FilteringHolder>
            </HeaderHolder>
        );
    };


    return (
        <div className={className}>
            <SubmissionListing heading="Active Submissions" renderHeading={renderHeading} phases={phases} searchText={debouncedSearchText} showOnHoldSubmissions={showOnHoldSubmissions}>

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