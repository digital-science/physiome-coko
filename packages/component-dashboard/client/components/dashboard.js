import React, { useContext, useEffect } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import moment from 'moment';
import debounce from 'lodash/debounce';

import { WorkflowDescriptionContext } from 'client-workflow-model';

import useCreateTaskMutation from './../mutations/createTask';
import useDestroySubmissionMutation from './../mutations/destroySubmission';
import useClaimSubmissionMutation from './../mutations/claimSubmission';
import useGetSubmissions from './../queries/getSubmissions';
import { useSubmissionWasCreatedSubscription, useSubmissionWasModifiedSubscription } from './../subscriptions/submissionsChanged';

import PopoverTrigger from 'component-task-form/client/components/popover';

import BinIconImage from './../static/bin.svg';
import Spinner from 'ds-awards-theme/components/spinner';
import Button from 'ds-awards-theme/components/button';
import { SmallInlineButton } from 'ds-awards-theme/components/inline-button';
import SubmissionStatusPill from './submission-status-pill';


const DashboardHolder = styled.div`
    padding: 32px;
`;


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

const ActiveAwardsHeader = styled.div`
    font-size: 17px;
    font-family: NovcentoSansWideBook, sans-serif;
    text-transform: uppercase;
`;

const DashboardTable = styled.table`

    table-layout: fixed;
    margin-top: 18px;
    width: 100%;
    
    border: none;
    border-spacing: 0;
    border-collapse: collapse;
    
    font-family: QuicksandRegular, sans-serif;

    tbody:before {
        content: "-";
        display: block;
        line-height: 11px;
        color: transparent;
    }

    th {
        background: white;
        padding: 14px 20px;
        font-size: 17px;
        text-align: left;
        
        border-right: 1px solid #ebebeb;
    }
    
    tbody {
        font-size: 14px;
    }
    
    tbody tr {
        border-bottom: 2px solid #ebebeb;
    }
    
    .small {
        width: 100px;
    }
    
    .medium {
        width: 150px;
    }
    
    .actions {
        width: 75px;
    }
        
    .status {
        width: 110px;
    }
    
    .manuscript_id {
        width: 60px;
    }

`;


function Dashboard(props) {


    const workflowDescription = useContext(WorkflowDescriptionContext);
    const submissionInstanceType = workflowDescription.findInstanceType('Submission');
    const submissionTaskID = submissionInstanceType.name;

    const createNewTask = useCreateTaskMutation(submissionTaskID);
    const destroySubmission = useDestroySubmissionMutation(submissionTaskID);
    const claimSubmission = useClaimSubmissionMutation(submissionTaskID);

    const createTaskUrl = (id) => {
        return `/submission/${id}`;
    };
    const { history, children } = props;

    const taskDefinition = workflowDescription.findInstanceType(submissionTaskID);


    function handleCreateNewTask() {
        createNewTask().then(data => {
            const { id } = data;
            history.push(createTaskUrl(id));
        });
    }

    const filter = {
        phase: [
            "Pending",
            "Saved",
            "Submitted",
            "Decision",
            "Payment",
            "Paid",
            "Publish",
            "Reject",
            "Published"
        ],
    };
    const sorting = { submissionDate: false };


    const { data, error, loading, refetch } = useGetSubmissions(filter, sorting);
    const throttledRefetch = debounce(refetch, 2000, { leading: true, trailing: true, maxWait:2000 });

    useSubmissionWasCreatedSubscription(submissionId => {
        return throttledRefetch();
    });

    useSubmissionWasModifiedSubscription(submissionId => {
        return throttledRefetch();
    });

    const refreshDashboard = () => {
        return throttledRefetch();
    };


    return (
        <DashboardHolder>

            <ActiveAwardsHeader>Active Submissions</ActiveAwardsHeader>

            <DashboardTable>
                <thead>
                    <tr className="heading">
                        <th className="small manuscript_id">ID</th>
                        <th>Submission Title</th>
                        <th className="small">Date</th>
                        <th className="small status">Status</th>
                        {/*<th>Authors</th>*/}
                        <th className="medium">Submitter</th>
                        <th className="medium">Assigned</th>
                        <th className="small actions">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {loading ? (
                        <tr>
                            <td colSpan={6}>
                                <Spinner center={true} />
                            </td>
                        </tr>) : null
                    }

                    {error ? (
                        <tr>
                            <td colSpan={6}>
                                An error occurred while loading the active award submissions.
                            </td>
                        </tr>) : null
                    }

                    {
                        data.submissions ?
                            data.submissions.map(submission =>
                                <ActiveSubmissionTableRow submission={submission} workflowDescription={workflowDescription}
                                    key={submission.id} refreshDashboard={refreshDashboard} claimSubmission={claimSubmission}
                                    destroySubmission={destroySubmission} />
                            ) : null
                    }
                </tbody>
            </DashboardTable>

            <AssignNewButton onClick={handleCreateNewTask}>
                <span>+</span>Create New Submission&hellip;
            </AssignNewButton>

            {children}

        </DashboardHolder>
    );
}


const SubmissionRow = styled.tr`
    background-color: white;
    
    td {
        padding: 15px;
    }
    
    td.date > span {
        color: darkgrey;
    }
`;

const DeleteIcon = styled(({className, ...rest}) => {
    return <img alt="delete award" className={className} src={BinIconImage} {...rest} />;
})`
    height: 20px;
    display: inline;
    margin-right: 5px;
`;


const AuthorListing = styled.ol`

  list-style: none;
  padding: 0;
  margin: 0;
  font-size: 12.6px;
  margin-top: 3px;
  
   overflow: hidden;
   text-overflow: ellipsis;
   display: -webkit-box;
   line-height: 14.49px;     /* fallback */
   max-height: 28.98px;      /* fallback */
   -webkit-line-clamp: 2; /* number of lines to show */
   -webkit-box-orient: vertical;

  
  & li {
    display: inline;
  }
  
  & li::after {
    content: ", ";
  }
  
  & li:last-child::after {
    content: "";
  }
`;


const TitleColumn = styled.td`
  > a {
      color: initial;
  }
  > a:visited {
      color: initial;
  }
  
  &.no-title span {
    font-style: italic;
    color: darkgrey;
  }
  
  &.no-title a {
    text-decoration-color: darkgrey;
  }
`;


const ManuscriptIDColumn = styled.td`
  > a {
      color: initial;
  }
  > a:visited {
      color: initial;
  }
`;


const IdentityColumn = styled.td`
  > span.no-identity {
      font-style: italic;
      color: darkgrey;
  }
`;



const LineLimitedText = styled.div`
   overflow: hidden;
   text-overflow: ellipsis;
   display: -webkit-box;
   line-height: 16.1px;     /* fallback */
   max-height: 32.2px;      /* fallback */
   -webkit-line-clamp: 2; /* number of lines to show */
   -webkit-box-orient: vertical;
`;




function ActiveSubmissionTableRow({submission, workflowDescription, claimSubmission, destroySubmission, refreshDashboard}) {

    const deleteSubmission = () => {
        destroySubmission(submission.id, {phase:"Cancelled"}).then(() => {
            refreshDashboard();
        });
    };

    const handleClaimSubmission = () => {
        claimSubmission(submission.id).then(r => {
            refreshDashboard();
        });
    };

    const title = submission.title ? <LineLimitedText>{submission.title}</LineLimitedText> : <React.Fragment><span>No title supplied</span></React.Fragment>;

    const linkElement = (el) => {
        return (submission.phase === "Pending" || submission.phase === "Saved")
            ? <Link to={`/submission/${submission.id}`}>{el}</Link> : <Link to={`/details/${submission.id}`}>{el}</Link>;
    };


    return (
        <SubmissionRow>
            <ManuscriptIDColumn className="small manuscript_id">
                {linkElement(submission.manuscriptId ? submission.manuscriptId : <span>-</span>)}
            </ManuscriptIDColumn>
            <TitleColumn className={`title ${!submission.title ? "no-title" : ""}`}>
                {linkElement(title)}
                {submission.authors && submission.authors instanceof Array && submission.authors.length ?
                    <AuthorListing>
                        {(submission.authors.map((a, i) => <li key={i}>{a.name}</li>))}
                    </AuthorListing> : null}
            </TitleColumn>
            <td className="date">
                {submission.submissionDate ? moment(submission.submissionDate).format("MMMM D, YYYY") : <span>&ndash;</span>}
            </td>
            <td className="small status">
                <SubmissionStatusPill submission={submission} />
            </td>

            {/*<td className="authors">
                {submission.authors && submission.authors instanceof Array && submission.authors.length ?
                    <AuthorListing>
                        {(submission.authors.map((a, i) => <li key={i}>{a.name}</li>))}
                    </AuthorListing> : null}
            </td>*/}

            <IdentityColumn className="submitter">
                {submission.submitter && submission.submitter.displayName ? <span>{submission.submitter.displayName}</span> : <span className="no-identity">&mdash;</span>}
            </IdentityColumn>

            <IdentityColumn className="curator">
                {(submission.curator && submission.curator.displayName)
                    ? <span>{submission.curator.displayName}</span>
                    : <SmallInlineButton bordered={true} onClick={handleClaimSubmission}>Assign to me</SmallInlineButton>
                }
            </IdentityColumn>

            <td className="small actions">
                <PopoverTrigger renderContent={() => {
                    return <Button onClick={deleteSubmission}>Delete Submission</Button>
                }}>
                    <DeleteIcon />
                </PopoverTrigger>
            </td>
        </SubmissionRow>
    );
}


export default Dashboard;