import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import moment from 'moment';

import useDestroySubmissionMutation from './../mutations/destroySubmission';
import useClaimSubmissionMutation from './../mutations/claimSubmission';

import PopoverTrigger from "ds-theme/components/popover";

import Spinner from "ds-theme/components/spinner";
import SubmissionStatusPill from "./submission-status-pill";
import {SmallInlineButton} from "ds-theme/components/inline-button";
import Button from "ds-theme/components/button";
import Pagination from 'ds-theme/components/pagination';

import BinIconImage from "../static/bin.svg";

const PaginationHolder = styled.div`
    margin-top: 5px;
    margin-bottom: 10px;
    display: flex;
    justify-content: space-between;
    
    &.loading > ${PaginationHolder} {
        opacity: 0.5;
        pointer-events: none;
    }
`;


const _SubmissionTable = ({className, submissionInstanceType, loading, error, submissions, pageInfo, pageSize, currentPage=1, setPage, refreshSubmissions}) => {

    const destroySubmission = useDestroySubmissionMutation(submissionInstanceType.name);
    const claimSubmission = useClaimSubmissionMutation(submissionInstanceType.name);
    const [displayedSubmissions, setDisplayedSubmissions] = useState(submissions);
    const [displayedPageInfo, setDisplayedPageInfo] = useState(pageInfo);

    if(submissions && displayedSubmissions !== submissions) {
        setDisplayedSubmissions(submissions);
    }

    if(!loading && displayedPageInfo !== pageInfo) {
        setDisplayedPageInfo(pageInfo);
    }

    return (
        <React.Fragment>
            <table className={className}>
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
                    {loading && !displayedSubmissions ? (
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
                        displayedSubmissions ?
                            displayedSubmissions.map(submission =>
                                <SubmissionTableRow key={submission.id} submission={submission}
                                    refreshSubmissions={refreshSubmissions} claimSubmission={claimSubmission}
                                    destroySubmission={destroySubmission} />
                            ) : null
                    }
                </tbody>
            </table>

            {displayedPageInfo ? (
                <PaginationHolder className={loading ? 'loading' : ''}>
                    <Pagination currentPage={currentPage} pageSize={pageSize} totalItems={displayedPageInfo.totalCount} setPage={setPage} />
                    {loading ? <div><Spinner /></div> : null}
                </PaginationHolder>) : null}
        </React.Fragment>
    );
};


const SubmissionTable = styled(_SubmissionTable)`

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

export default SubmissionTable;




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




const SubmissionTableRow = ({submission, claimSubmission, destroySubmission, refreshSubmissions}) => {

    const deleteSubmission = () => {
        destroySubmission(submission.id, {phase:"Cancelled"}).then(() => {
            refreshSubmissions();
        });
    };

    const handleClaimSubmission = () => {
        claimSubmission(submission.id).then(r => {
            refreshSubmissions();
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
};