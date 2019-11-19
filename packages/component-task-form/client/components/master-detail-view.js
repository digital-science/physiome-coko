import React from 'react';

import useViewInstanceData from './../hooks/useViewInstanceData';
import MasterDetailLayout from './master-detail-layout';


export default function MasterDetailView({ instanceId, instanceType, layoutDefinition, workflowDescription, dataContextRef=null }) {

    // Views: read-only data set, does not support changing data values (can support inline-task-forms which allow for data editing).

    const {instance, tasks, error, loading, viewData, refetchViewData, fieldRegistry} = useViewInstanceData({instanceId, instanceType, layoutDefinition, workflowDescription});
    const fieldListingProps = {fieldRegistry, data:viewData, refetchData:refetchViewData, tasks, instanceId, instanceType, workflowDescription};
    if(dataContextRef) {
        dataContextRef.current = fieldListingProps;
    }

    return (
        <MasterDetailLayout elements={layoutDefinition.elements} data={viewData} loading={loading} error={error}
            instance={instance} fieldListingProps={fieldListingProps} />
    );
};