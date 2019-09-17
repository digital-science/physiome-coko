import React from 'react';
import styled from 'styled-components';

import { mergeFetchFields, bindingToFetchFields } from 'component-task-form/client/utils/helpers'


const TaskTableColumnHeaderComponent = styled.th`
`;

const TaskTableColumnContentComponent = styled.td`
`;


class TaskTableColumn {

    constructor(heading, dependentFields, columnClassName = '', renderChildren=null, columnHeaderComponent=null, columnContentComponent=null, columnContentClassName=null) {

        this._heading = heading;
        this._columnClassName = columnClassName;
        this._columnContentClassName = columnContentClassName;

        this._dependentFields = dependentFields;
        this._renderChildren = renderChildren;
        this._columnHeaderComponent = columnHeaderComponent || TaskTableColumnHeaderComponent;
        this._columnContentComponent = columnContentComponent || TaskTableColumnContentComponent;
    }

    get columnHeading() {
        return this._heading;
    }

    get columnClassName() {
        return this._columnClassName || '';
    }

    get dependentTaskFields() {
        return (this._dependentFields || null);
    }

    renderHeader(key, workflowDescription, instanceType) {
        const ColumnHeaderComponent = this._columnHeaderComponent;
        return <ColumnHeaderComponent key={key} className={this.columnClassName}>{this.columnHeading}</ColumnHeaderComponent>;
    }

    determineContentClassName(className, columnClassName, props) {

        if(this._columnContentClassName) {
            const replacementColumnClassName = (typeof this._columnContentClassName === 'function') ? this._columnContentClassName(props, this) : this._columnContentClassName;
            return `${className || ''} ${replacementColumnClassName || ''}`;
        }

        return `${className || ''} ${columnClassName || ''}`;
    }

    renderRowContent(props={}) {

        const ColumnContentComponent = this._columnContentComponent;
        const { columnIndex, className, ...rest } = props;
        const { task } = rest;

        return (
            <ColumnContentComponent key={columnIndex} className={this.determineContentClassName(className, this.columnClassName, rest)}>
                {this.renderRowChildren(rest)}
            </ColumnContentComponent>
        );
    }

    renderRowChildren(props) {
        return this._renderChildren ? this._renderChildren(props, this) : null;
    }
}


export default TaskTableColumn;
export { TaskTableColumnHeaderComponent, TaskTableColumnContentComponent };


export function convertDependentFields(fields) {

    if(!fields) {
        return null;
    }

    if(typeof fields === 'string' || fields instanceof Array) {

        const f = typeof fields === 'string' ? fields.split(",") : fields;
        const r = {};

        f.forEach(field => mergeFetchFields(r, bindingToFetchFields(field)));
        return r;

    } else if(typeof fields === 'object') {

        return fields;
    }

    return null;
}


function createColumn(heading, dependentFields, columnClassName, renderChildren, columnHeaderComponent=null, columnContentComponent=null, columnContentClassName=null) {

    return new TaskTableColumn(heading, convertDependentFields(dependentFields), columnClassName,
                               renderChildren, columnHeaderComponent, columnContentComponent, columnContentClassName);
}

export { createColumn };



