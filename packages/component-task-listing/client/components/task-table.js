import React, { useState, useMemo } from 'react';
import styled from 'styled-components';

import TaskTableRow from './task-table-row';
import Spinner from "ds-theme/components/spinner";
import Pagination from 'ds-theme/components/pagination';

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


const _TaskTable = ({className, columns, workflowDescription, instanceType, loading, error, tasks, pageInfo, pageSize,
                     currentPage=1, setPage, refreshListing, history}) => {

    const [displayedTasks, setDisplayedTasks] = useState(tasks);
    const [displayedPageInfo, setDisplayedPageInfo] = useState(pageInfo);

    if(tasks && displayedTasks !== tasks) {
        setDisplayedTasks(tasks);
    }

    if(!loading && displayedPageInfo !== pageInfo) {
        setDisplayedPageInfo(pageInfo);
    }

    const columnHeaders = useMemo(() => {
        return columns.map((col, index) => col.renderHeader(index, workflowDescription, instanceType));
    }, [columns, workflowDescription, instanceType]);

    const rowProps = useMemo(() => {

        return {
            columns,
            refreshListing,
            history,
            workflowDescription,
            instanceType
        };

    }, [columns, refreshListing, history, workflowDescription, instanceType]);


    return (
        <React.Fragment>
            <table className={className}>
                <thead>
                    <tr className="heading">
                        {columnHeaders}
                    </tr>
                </thead>
                <tbody>
                    {loading && !displayedTasks ? (
                        <tr>
                            <td colSpan={columns.length}>
                                <Spinner center={true} />
                            </td>
                        </tr>) : null
                    }

                    {error ? (
                        <tr>
                            <td colSpan={columns.length}>
                            An error occurred while loading the active award nominations.
                            </td>
                        </tr>) : null
                    }

                    {displayedTasks ?
                        displayedTasks.map(task =>
                            <TaskTableRow key={task.id} task={task} {...rowProps} />
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


const TaskTable = styled(_TaskTable)`

    table-layout: fixed;
    margin-top: 18px;
    width: 100%;
    
    border: none;
    border-spacing: 0;
    border-collapse: collapse;
    
    font-family: QuicksandRegular, sans-serif;

    & tbody:before {
        content: "-";
        display: block;
        line-height: 11px;
        color: transparent;
    }

    & th {
        background: white;
        padding: 14px 20px;
        font-size: 17px;
        text-align: left;
        
        border-right: 1px solid #ebebeb;
    }
    
    & tbody {
        font-size: 14px;
    }
    
    & tbody tr {
        border-bottom: 2px solid #ebebeb;
    }
    
    & .small {
        width: 100px;
    }
    
    & .medium {
        width: 150px;
    }
    
    & .actions {
        width: 75px;
    }
        
    & .status {
        width: 150px;
    }
`;

export default TaskTable;
export { PaginationHolder };