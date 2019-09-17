import React, { useMemo, useState, useEffect } from 'react';
import styled from 'styled-components';
import debounce from 'lodash/debounce';

import useGetInstances from './../queries/getInstances';
import { useInstanceWasCreatedSubscription, useInstanceWasModifiedSubscription } from './../subscriptions/instanceChanged';

import { mergeFetchFields } from 'component-task-form/client/utils/helpers'

import TaskTable from './task-table';


const TaskListingHeader = styled.div`
    font-size: 17px;
    font-family: NovcentoSansWideBook, sans-serif;
    text-transform: uppercase;
`;

const _TaskListing = ({className, children, heading, workflowDescription, instanceType, columns, history,
                       renderHeading=null, filter = null, sorting = {}, pageSize = 10, additionalQueryFields = null,
                       additionalQueryValues = null}) => {

    const dependentFields = useMemo(() => {

        const mergedFields = {id:null};
        columns.forEach(col => mergeFetchFields(mergedFields, col.dependentTaskFields || {}));
        return mergedFields;

    }, [columns]);

    const [page, setPage] = useState(0);
    useEffect(() => {
        setPage(0);
    }, [filter, ...(additionalQueryValues ? Object.values(additionalQueryValues) : [])]);

    const variables = useMemo(() => {

        const vars = {
            first: pageSize,
            offset: (page * pageSize),
            filter,
            sorting
        };

        if(additionalQueryValues) {
            for(let k in additionalQueryValues) {
                if(additionalQueryValues.hasOwnProperty(k)) {
                    vars[k] = additionalQueryValues[k];
                }
            }
        }

        return vars;

    }, [page, pageSize, filter, sorting, additionalQueryValues]);


    const { data, error, loading, refetch } = useGetInstances(instanceType, dependentFields, variables, additionalQueryFields);
    const throttledRefetch = debounce(refetch, 2000, { leading: true, trailing: true, maxWait:2000 });

    useInstanceWasCreatedSubscription(instanceType, nominationId => {
        return throttledRefetch();
    });

    useInstanceWasModifiedSubscription(instanceType, nominationId => {
        return throttledRefetch();
    });

    const refreshListing = () => {
        return throttledRefetch();
    };

    const changeDisplayedPage = (page) => {
        setPage(page - 1);
    };


    const header = <TaskListingHeader>{heading}</TaskListingHeader>;

    return (
        <div className={className}>
            {renderHeading ? renderHeading({header, heading}) : header}

            <TaskTable workflowDescription={workflowDescription} instanceType={instanceType} columns={columns}
                loading={loading} error={error} history={history} refreshListing={refreshListing}
                tasks={data && data.results ? data.results.results : null} pageInfo={data && data.results ? data.results.pageInfo : null}
                currentPage={page + 1} pageSize={pageSize} setPage={changeDisplayedPage}  />

            {children}
        </div>
    );
};


const TaskListing = styled(_TaskListing)`
`;

export default TaskListing;

export { TaskListingHeader };