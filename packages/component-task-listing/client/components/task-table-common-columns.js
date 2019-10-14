import React from 'react';
import styled from 'styled-components';
import moment from "moment";
import get from 'lodash/get';


import TaskTable from './task-table';
import TaskTableColumn, { TaskTableColumnHeaderComponent, TaskTableColumnContentComponent, convertDependentFields } from "./task-table-column";

import { mergeFetchFields, bindingToFetchFields } from 'component-task-form/client/utils/helpers'




// --- Column: Text Column
// ----

const TextColumnHeader = styled(TaskTableColumnHeaderComponent)`
`;
const TextColumnContent = styled(TaskTableColumnContentComponent)`
  > a {
      color: initial;
  }
  > a:visited {
      color: initial;
  }
  
  &.placeholder span {
    font-style: italic;
    color: darkgrey;
  }
  
  &.placeholder a {
    text-decoration-color: darkgrey;
  }
`;

function createTextColumn(heading, textFieldName, linkifyText=null, textFormatter=null, placeholder="-", dependentFields=null) {

    const combinedDepFields = bindingToFetchFields(textFieldName);
    if(dependentFields) {
        mergeFetchFields(combinedDepFields, convertDependentFields(dependentFields));
    }

    const renderChildren = ({task}) => {
        const text = task ? get(task, textFieldName) : null;
        const el = text ? <React.Fragment>{text}</React.Fragment> : (placeholder ? <span>-</span> : null);
        return linkifyText ? linkifyText(task, el) : el;
    };

    const columnContentClassName = ({task}) => {
        if(!task) {
            return 'placeholder';
        }
        const v = get(task, textFieldName);
        return (v && v.length) ? '' : 'placeholder';
    };

    return new TaskTableColumn(heading, combinedDepFields, null, renderChildren, TextColumnHeader, TextColumnContent, columnContentClassName);
}

export { createTextColumn };



// --- Column: Mapped Text Column
// ----

const MappedTextColumnHeader = styled(TaskTableColumnHeaderComponent)`
`;
const MappedTextColumnContent = styled(TaskTableColumnContentComponent)`
  &.placeholder span {
    font-style: italic;
    color: darkgrey;
  }
`;

function createMappedTextColumn(heading, fieldName, mappingRef, opts = {}) {

    const { className=null, linkifyValue=null, placeholder="-", dependentFields=null } = opts;

    const combinedDepFields = bindingToFetchFields(fieldName);
    if(dependentFields) {
        mergeFetchFields(combinedDepFields, convertDependentFields(dependentFields));
    }


    let resolvedMapping = undefined;

    const resolveMapping = (workflowDescription) => {
        if(!workflowDescription) {
            return null;
        }
        if(resolvedMapping !== undefined) {
            return resolvedMapping;
        }
        return (resolvedMapping = workflowDescription.resolveDisplayMapping(mappingRef));
    };

    const renderChildren = ({task, workflowDescription}, column) => {

        const value = task ? get(task, fieldName) : null;
        const mapping = resolveMapping(workflowDescription);
        const displayedValue = (value && mapping) ? mapping.mapping[value] : null;

        const el = displayedValue ? <React.Fragment>{displayedValue}</React.Fragment> : (placeholder ? <span>-</span> : null);
        return linkifyValue ? linkifyValue(task, el) : el;
    };

    const columnContentClassName = ({task, workflowDescription}, column) => {

        const value = task ? get(task, fieldName) : null;
        const mapping = resolveMapping(workflowDescription);

        return (value && mapping && mapping.mapping[value]) ? '' : 'placeholder';
    };

    return new TaskTableColumn(heading, combinedDepFields, className, renderChildren, MappedTextColumnHeader, MappedTextColumnContent, columnContentClassName);
}

export { createMappedTextColumn };



// --- Column: Identifier Column
// ----

const IDColumnHeader = styled(TaskTableColumnHeaderComponent)`
  width: 60px;
`;
const IDColumnContent = styled(TaskTableColumnContentComponent)`
  width: 60px;

  > a {
      color: initial;
  }
  > a:visited {
      color: initial;
  }
`;

function createIdentifierColumn(heading, idFieldName, linkifyIdentifier=null, dependentFields=null) {

    const combinedDepFields = bindingToFetchFields(idFieldName);
    if(dependentFields) {
        mergeFetchFields(combinedDepFields, convertDependentFields(dependentFields));
    }

    return new TaskTableColumn(heading, combinedDepFields, null, ({task}) => {
        const identifier = task ? get(task, idFieldName) : null;
        const el = identifier ? <React.Fragment>{identifier}</React.Fragment> : <span>-</span>;
        return linkifyIdentifier ? linkifyIdentifier(task, el) : el;

    }, IDColumnHeader, IDColumnContent);
}

export { createIdentifierColumn };



// --- Column: Date Column
// ----

const DateColumnHeader = styled(TaskTableColumnHeaderComponent)`
  ${TaskTable} &.small {
    width: 125px;
  }
`;
const DateColumnContent = styled(TaskTableColumnContentComponent)`
  & > span {
    color: darkgrey;
  }
`;

function createDateColumn(heading, dateFieldName, opts = {}) {

    const { className = "small", dateFormat="MMMM D, YYYY", dependentFields=null } = opts;

    const combinedDepFields = bindingToFetchFields(dateFieldName);
    if(dependentFields) {
        mergeFetchFields(combinedDepFields, convertDependentFields(dependentFields));
    }

    return new TaskTableColumn(heading, combinedDepFields, className, ({task}) => {

        const dateValue = task ? get(task, dateFieldName) : null;
        return dateValue ? <React.Fragment>{moment(dateValue).format(dateFormat)}</React.Fragment> : <span>&ndash;</span>;

    }, DateColumnHeader, DateColumnContent);
}

export { createDateColumn };




// --- Column: Identity Column
// ----

const IdentityColumnHeader = styled(TaskTableColumnHeaderComponent)`
`;
const IdentityColumnContent = styled(TaskTableColumnContentComponent)`
  > span.no-identity {
      font-style: italic;
      color: darkgrey;
  }
`;

function createIdentityColumn(heading, identityFieldName, opts = {}) {

    const { className="medium", dependentFields=null } = opts;
    const combinedDepFields = {};

    if(identityFieldName) {
        mergeFetchFields(combinedDepFields, convertDependentFields([`${identityFieldName}.id`, `${identityFieldName}.displayName`]));
    }

    if(dependentFields) {
        mergeFetchFields(combinedDepFields, convertDependentFields(dependentFields));
    }

    return new TaskTableColumn(heading, combinedDepFields, className, ({task}) => {

        const identity = task ? get(task, identityFieldName) : null;
        return (identity && identity.displayName) ? <span>{identity.displayName}</span> : <span className="no-identity">&mdash;</span>

    }, IdentityColumnHeader, IdentityColumnContent);
}

export { createIdentityColumn };



// --- Column: Status Column
// ----

const StatusColumnHeader = styled(TaskTableColumnHeaderComponent)`
  width: 150px;
`;
const StatusColumnContent = styled(TaskTableColumnContentComponent)`
  width: 150px;
`;

function createStatusColumn(heading, dependentFields, statusComponent, opts = {}, componentOpts = {}) {

    const { className = "small status" } = opts;
    const Status = statusComponent;

    return new TaskTableColumn(heading, convertDependentFields(dependentFields), className,
                               ({task}) => <Status task={task} {...componentOpts} />, StatusColumnHeader, StatusColumnContent);
}

export { createStatusColumn };
