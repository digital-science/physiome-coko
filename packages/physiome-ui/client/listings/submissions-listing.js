import React, { useState, useEffect, useContext } from 'react';
import styled from 'styled-components';

import { WorkflowDescriptionContext } from 'client-workflow-model';

import { TaskListing, TaskListingHeader } from 'component-task-listing/client';
import { createDateColumn, createIdentifierColumn, createIdentityColumn, createStatusColumn } from 'component-task-listing/client';
import { createSubmissionTitleColumn, createCuratorClaimableIdentityColumn, linkSubmissionElement, linkSubmissionElementForSubmitter } from './column-types';

import { HeaderHolder } from 'component-task-listing/client/components/task-listing-header';

import SubmissionStatusPill from "../components/submission-status-pill";


const SubmissionListingColumns = [

    createIdentifierColumn("ID", 'manuscriptId', linkSubmissionElement, ["manuscriptId", "id", "phase"]),

    createSubmissionTitleColumn('Manuscript Title'),

    createDateColumn("Date", 'submissionDate'),

    createStatusColumn("Status", ['phase', 'hidden', 'curator'], SubmissionStatusPill),

    createIdentityColumn("Submitter", "submitter"),

    createCuratorClaimableIdentityColumn("Assigned", "curator")
];


const SimpleSubmissionListingColumns = [

    createIdentifierColumn("ID", 'manuscriptId', linkSubmissionElementForSubmitter, ["manuscriptId", "id", "phase"]),

    createSubmissionTitleColumn('Manuscript Title', linkSubmissionElementForSubmitter, ),

    createDateColumn("Date", 'submissionDate'),

    createStatusColumn("Status", ['phase', 'hidden'], SubmissionStatusPill, {}, {ignoreHidden:true}),       // Note: submitters don't see the "checking" phase

    createIdentityColumn("Submitter", "submitter")
];



const _SubmissionsListing = ({className, history, heading, allFilterPhases=[], defaultActiveFilterPhases=[], pageSize=10,
                              showSearch=true, showFilter=true, columns=SubmissionListingColumns, renderAdditionalFilters=null,
                              showOnHoldSubmissions=undefined, searchPlaceholder='Search submissions…', renderNoSubmissions=null, children=null}) => {

    const workflowDescription = useContext(WorkflowDescriptionContext);
    const instanceType = workflowDescription.findInstanceType('Submission');

    const [phases, setPhases] = useState(defaultActiveFilterPhases.slice(0));
    const [searchText, setSearchText] = useState("");
    const [filter, setFilter] = useState({phase:phases});
    const [sorting, setSorting] = useState({submissionDate:true});

    const additionalQueryFields = {searchText: 'String'};
    const [additionalQueryValues, setAdditionalQueryValues] = useState({searchText:null});

    const setFilteredPhases = (newPhases) => {
        setPhases(newPhases);
    };

    const searchTextDidChange = (text) => {
        setSearchText(text);
    };

    useEffect(() => {

        const newFilter = {phase:phases};

        if(showOnHoldSubmissions !== undefined && showOnHoldSubmissions === true) {
            filter.hidden = showOnHoldSubmissions;
        }

        if(filter.phase !== phases || filter.hidden !== showOnHoldSubmissions) {
            setFilter(newFilter);
        }
    }, [phases, showOnHoldSubmissions]);

    useEffect(() => {
        setAdditionalQueryValues({searchText:(searchText && searchText.length ? searchText : null)});
    }, [searchText]);


    const renderHeading = ({header}) => {
        return (
            <HeaderHolder>
                {header}
                <TaskListingHeader showSearch={showSearch} showFilter={showFilter} setFilteredPhases={setFilteredPhases} searchTextDidChange={searchTextDidChange}
                    allFilterPhases={allFilterPhases} defaultActiveFilterPhases={defaultActiveFilterPhases} searchPlaceholder={searchPlaceholder}
                    renderAdditionalFilters={renderAdditionalFilters} />
            </HeaderHolder>
        );
    };

    return (
        <div className={className}>
            <TaskListing heading={heading} columns={columns} workflowDescription={workflowDescription} instanceType={instanceType}
                history={history} renderHeading={renderHeading} pageSize={pageSize} filter={filter} sorting={sorting} additionalQueryFields={additionalQueryFields}
                additionalQueryValues={additionalQueryValues} renderEmptyResults={renderNoSubmissions}>

                {children}

            </TaskListing>
        </div>
    );
};

const SubmissionsListing = styled(_SubmissionsListing)`
  padding: 32px;
`;

export default SubmissionsListing;

export { SubmissionListingColumns, SimpleSubmissionListingColumns };