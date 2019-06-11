import React, { useContext, useEffect } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import moment from 'moment';

import { WorkflowDescriptionContext } from 'client-workflow-model';

import useCompleteInstanceTask from 'component-task-form/client/mutations/completeInstanceTask';
import useCreateTaskMutation from './../mutations/createTask';
import useDestroySubmissionMutation from './../mutations/destroySubmission';
import useClaimSubmissionMutation from './../mutations/claimSubmission';
import useGetSubmissions from './../queries/getSubmissions';

import PopoverTrigger from 'component-task-form/client/components/popover';

import BinIconImage from './../static/bin.svg';
import Spinner from 'ds-awards-theme/components/spinner';
import Button, { SmallPlainButton } from 'ds-awards-theme/components/button';
import SubmissionStatusPill from './submission-status-pill';
import { FaUserCheck } from 'react-icons/fa';


import './dashboard.css';


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
        font-size: 15px;
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

`;


function Dashboard(props) {


    const workflowDescription = useContext(WorkflowDescriptionContext);
    const submissionInstanceType = workflowDescription.findInstanceType('Submission');
    const submissionTaskID = submissionInstanceType.name;

    const createNewTask = useCreateTaskMutation(submissionTaskID);
    const destroySubmission = useDestroySubmissionMutation(submissionTaskID);
    const claimSubmission = useClaimSubmissionMutation(submissionTaskID);
    const completeInstanceTask = useCompleteInstanceTask(submissionInstanceType);

    const createTaskUrl = (id, taskName, taskId) => {
        return `/submission/${id}`;
        //return `/task/submission/${id}/${taskName}/${taskId}`;
    };
    const { history, children } = props;

    const taskDefinition = workflowDescription.findInstanceType(submissionTaskID);


    function handleCreateNewTask() {
        createNewTask().then(data => {
            const { id, tasks } = data;
            if(id && tasks && tasks.length) {

                const tasksWithForms = taskDefinition.primaryTasksFromTaskList(tasks);
                if(tasksWithForms && tasksWithForms.length) {
                    const primaryTask = tasksWithForms[0];
                    history.push(createTaskUrl(id, primaryTask.formKey.replace(/custom:/gi, ""), primaryTask.id));
                }
            }
        });
    }

    const filter = {
        phase: [
            "Pending",
            "Submitted",
            "Checking",
            "Decision",
            "Publish",
            "Reject",
            "Published"
        ],
    };
    const sorting = { submissionDate: false };


    const { data, error, loading, refetch } = useGetSubmissions(filter, sorting);

    const refreshDashboard = () => {
        return refetch();
    };

    // On a set interval, refresh the data fot the dashboard.
    // FIXME: this is here just until subscription and pushes are implemented.

    useEffect(() => {
        const timer = setInterval(() => {
            refreshDashboard();
        }, 3000);

        return () => {
            clearInterval(timer);
        };
    });


    return (
        <DashboardHolder>

            <ActiveAwardsHeader>Active Submissions</ActiveAwardsHeader>

            <DashboardTable>
                <thead>
                    <tr className="heading">
                        <th>Submission Title</th>
                        <th className="small">Date</th>
                        <th className="small status">Status</th>
                        <th>Authors</th>
                        <th className="medium">Submitter</th>
                        <th className="medium">Assigned</th>
                        <th className="small actions">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {loading ? (
                        <tr>
                            <td colSpan={6}>
                                <Spinner center={true}/>
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
                                    destroySubmission={destroySubmission} completeInstanceTask={completeInstanceTask} />
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


const IdentityColumn = styled.td`
  > span.no-identity {
      font-style: italic;
      color: darkgrey;
  }
`;

const UserChecksIconHolder = styled(Link)`

  & {
    color: initial;
  }

  &:visited {
    color: initial;
  }

  > svg {
    height: 20px;
    width: 20px;
    margin-right: 4px;
  }
`;



const LineLimitedText = styled.div`
   overflow: hidden;
   text-overflow: ellipsis;
   display: -webkit-box;
   line-height: 17.25px;     /* fallback */
   max-height: 34.5px;      /* fallback */
   -webkit-line-clamp: 2; /* number of lines to show */
   -webkit-box-orient: vertical;
`;




function ActiveSubmissionTableRow({submission, workflowDescription, claimSubmission, destroySubmission, refreshDashboard, completeInstanceTask}) {

    // Determine the current status to apply to the submission.
    const { tasks } = submission;
    const submissionTask = (tasks && tasks.length && tasks.find(task => task.formKey === "custom:submission"));
    const claimTask = (tasks && tasks.length && tasks.find(task => task.formKey === "custom:claim"));
    const checkTask = (tasks && tasks.length && tasks.find(task => task.formKey === "custom:checks"));

    const checksActionIcon = checkTask ? <UserChecksIconHolder to={`/details/${encodeURI(submission.id)}`}><FaUserCheck /></UserChecksIconHolder> : null;

    const deleteSubmission = () => {
        destroySubmission(submission.id, {phase:"Cancelled"}).then(() => {
            refreshDashboard();
        });
    };

    const handleClaimSubmission = () => {
        if(!claimTask) {
            return;
        }

        claimSubmission(submission.id).then(result => {

            if(result) {
                completeInstanceTask(submission.id, claimTask.id, {phase:"Checking"}).then(() => {
                    refreshDashboard();
                });
            }
        });
    };

    const title = submission.title ? <LineLimitedText>{submission.title}</LineLimitedText> : <span>No title supplied</span>;
    let linkedTitle;

    if(submissionTask) {
        linkedTitle = <Link to={`/submission/${submission.id}`}>{title}</Link>;
    } else {
        linkedTitle = <Link to={`/details/${submission.id}`}>{title}</Link>;
    }

    return (
        <SubmissionRow>
            <TitleColumn className={`title ${!submission.title ? "no-title" : ""}`}>
                {linkedTitle}
            </TitleColumn>
            <td className="date">
                {submission.submissionDate ? moment(submission.submissionDate).format("MMMM D, YYYY") : <span>&ndash;</span>}
            </td>
            <td className="small status">
                <SubmissionStatusPill submission={submission} />
            </td>
            <td className="authors">
                {submission.authors && submission.authors instanceof Array && submission.authors.length ?
                    <AuthorListing>
                        {(submission.authors.map((a, i) => <li key={i}>{a.name}</li>))}
                    </AuthorListing> : null}
            </td>

            <IdentityColumn className="submitter">
                {submission.submitter && submission.submitter.displayName ? <span>{submission.submitter.displayName}</span> : <span className="no-identity">&mdash;</span>}
            </IdentityColumn>

            <IdentityColumn className="curator">
                {claimTask ? <SmallPlainButton onClick={handleClaimSubmission}>Assign to me</SmallPlainButton> :
                    (submission.curator && submission.curator.displayName) ? <span>{submission.curator.displayName}</span> : <span className="no-identity">&mdash;</span>
                }
            </IdentityColumn>

            <td className="small actions">
                {checksActionIcon}

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