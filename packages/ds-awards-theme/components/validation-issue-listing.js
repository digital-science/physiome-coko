import React from 'react';
import styled from 'styled-components';
import { th } from '../src/index';


const _ValidationIssueList = ({className, issues}) => {

    if(!issues || !issues.length) {
        return null;
    }

    return (
        <ul className={className}>
            {issues.map((warning, index) => <li key={index}>{warning}</li>)}
        </ul>
    );
};

const ValidationIssueList = styled(_ValidationIssueList)`
  width: 100%;
  box-sizing: border-box;
  font-family: ${th('validationIssueList.fontFamily')};
  font-size: ${th('validationIssueList.default.fontSize')};
  color: ${th('validationIssueList.textColor')};
  
  list-style: none;
  padding: 0;
  margin: 5px 0;
`;


const SmallValidationIssueList = styled(_ValidationIssueList)`
  font-size: ${th('validationIssueList.small.fontSize')};
`;

export default ValidationIssueList;
export { ValidationIssueList, SmallValidationIssueList };
