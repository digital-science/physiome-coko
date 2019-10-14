import React, { useContext, useState, useMemo } from 'react';
import styled from 'styled-components';

import { WorkflowDescriptionContext } from 'client-workflow-model';
import useCreateSubmissionMutation from "../mutations/createSubmission";

import SubmissionsListing, { SimpleSubmissionListingColumns } from '../listings/submissions-listing';
import Card from "ds-theme/components/card";
import { BlockLabel } from "ds-theme/components/label";
import { PrimaryInlineButton } from "ds-theme/components/inline-button";


const AllPhases = [
    "Saved",
    "Submitted",
    "Decision",
    "Payment",
    "Paid",
    "Publish",
    "Published",
    "Reject"
];

const ActivePhases = [
    "Saved",
    "Submitted",
    "Decision",
    "Payment",
    "Paid",
    "Publish",
    "Published",
    "Reject"
];


const CreateNewSubmissionButton = styled.button`
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


const EmptySubmissionsListHolder = styled.div`

  display: flex;
  justify-content: center;

  & > div {
    max-width: calc(100vw / 2);
  }
`;

const EmptySubmissionsCardContent = styled.div`
  padding: 0.5em 1em;
  text-align: center;
  
  & ${PrimaryInlineButton} {
    margin-top: 1.5em;
  }
`;




const _DashboardSubmitterSubmissions = ({className, history, children}) => {

    const workflowDescription = useContext(WorkflowDescriptionContext);
    const submissionInstanceType = useMemo(() => workflowDescription.findInstanceType('Submission'), [workflowDescription]);
    const createNewSubmission = useCreateSubmissionMutation(submissionInstanceType);


    function handleCreateNewSubmission() {
        createNewSubmission().then(data => {
            const { id } = data;
            history.push(`/submission/${id}`);
        });
    }

    const renderNoSubmissions = () => {
        return (
            <EmptySubmissionsListHolder>
                <div>
                    <Card>
                        <EmptySubmissionsCardContent>
                            <BlockLabel>You do not currently have any manuscript submissions underway.</BlockLabel>
                            <PrimaryInlineButton bordered={true} onClick={handleCreateNewSubmission}>
                                Begin Manuscript Submission
                            </PrimaryInlineButton>
                        </EmptySubmissionsCardContent>
                    </Card>
                </div>
            </EmptySubmissionsListHolder>
        );
    };

    return (
        <div className={className}>

            <SubmissionsListing history={history} columns={SimpleSubmissionListingColumns} heading='Submissions'
                allFilterPhases={AllPhases} defaultActiveFilterPhases={ActivePhases} showFilter={false}
                showOnHoldSubmissions={null} renderNoSubmissions={renderNoSubmissions}>

                <CreateNewSubmissionButton onClick={handleCreateNewSubmission}>
                    <span>+</span>Create New Submission&hellip;
                </CreateNewSubmissionButton>

                {children}

            </SubmissionsListing>

        </div>
    );
};

const DashboardSubmitterSubmissions = styled(_DashboardSubmitterSubmissions)`
`;

export default DashboardSubmitterSubmissions;


