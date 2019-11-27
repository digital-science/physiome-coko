import React, { useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import get from 'lodash/get';

import { createColumn, TaskTableColumnContentComponent } from 'component-task-listing/client';
import useClaimSubmissionMutation from '../mutations/claimSubmission';

import { SmallInlineButton } from "ds-theme/components/inline-button";


const SubmissionTitleColumn = styled(TaskTableColumnContentComponent)`
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

const LineLimitedText = styled.div`
   overflow: hidden;
   text-overflow: ellipsis;
   display: -webkit-box;
   line-height: 16.1px;     /* fallback */
   max-height: 32.2px;      /* fallback */
   -webkit-line-clamp: 2; /* number of lines to show */
   -webkit-box-orient: vertical;
`;


const linkSubmissionElement = (submission, el) => {
    return (submission.phase === "Pending" || submission.phase === "Saved")
        ? <Link to={`/submission/${submission.id}`}>{el}</Link> : <Link to={`/details/${submission.id}`}>{el}</Link>;
};

const linkSubmissionElementForSubmitter = (submission, el) => {

    if(submission.phase === 'Revision') {
        return <Link to={`/revisions/${submission.id}`}>{el}</Link>;
    }
    return linkSubmissionElement(submission, el);
};


export { linkSubmissionElement, linkSubmissionElementForSubmitter };



function createSubmissionTitleColumn(heading, linkifyElement = linkSubmissionElement, opts={}, titleField='title', phaseField='phase', authorsField='authors') {

    const { className = "" } = opts;

    return createColumn(heading, [titleField, phaseField, authorsField], className, ({task}) => {

        const title = get(task, titleField);
        const authors = get(task, authorsField);
        const formattedTitle = title ? <LineLimitedText>{title}</LineLimitedText> : <React.Fragment><span>No title supplied</span></React.Fragment>;

        return (
            <React.Fragment>
                {linkifyElement(task, formattedTitle)}
                {authors && authors instanceof Array && authors.length ?
                    <AuthorListing>
                        {(authors.map((a, i) => <li key={i}>{a.name}</li>))}
                    </AuthorListing> : null}
            </React.Fragment>
        );

    }, null, SubmissionTitleColumn, ({task}) => {

        return `title ${!task.title ? "no-title" : ""}`;
    });
}



function createCuratorClaimableIdentityColumn(heading, identityField, submissionIdField='id', opts={}) {

    const { className = "" } = opts;
    const dependentFields = [
        `${identityField}.id`,
        `${identityField}.displayName`
    ];

    return createColumn(heading, dependentFields, `${className} medium`, ({task, workflowDescription, refreshListing}) => {

        const instanceType = useMemo(() => workflowDescription.findInstanceType('Submission'), [workflowDescription]);
        const claimSubmission = useClaimSubmissionMutation(instanceType);

        const handleClaimSubmission = useCallback(() => {
            claimSubmission(get(task, submissionIdField)).then(r => {
                refreshListing();
            });
        }, [task, claimSubmission]);

        const identity = get(task, identityField);

        return (
            <React.Fragment>
                {(identity && identity.displayName)
                    ? <span>{identity.displayName}</span>
                    : <SmallInlineButton bordered={true} onClick={handleClaimSubmission}>Assign to me</SmallInlineButton>
                }
            </React.Fragment>
        );
    });
}



export { createSubmissionTitleColumn, createCuratorClaimableIdentityColumn };
