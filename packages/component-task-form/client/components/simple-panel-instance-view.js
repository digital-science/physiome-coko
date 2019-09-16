import React from 'react';

import useViewInstanceData from './../hooks/useViewInstanceData';
import SimplePanelLayout from './simple-panel-layout';


export default function SimplePanelInstanceView({ className, instanceId, instanceType, viewDefinition, workflowDescription }) {

    const {instance, tasks, error, loading, viewData, refetchViewData, fieldRegistry} = useViewInstanceData({instanceId, instanceType, viewDefinition, workflowDescription});
    const fieldListingProps = {fieldRegistry, data:viewData, refetchData:refetchViewData, tasks, instanceId, instanceType, workflowDescription};

    return (
        <SimplePanelLayout className={className} elements={viewDefinition.elements} data={viewData} loading={loading} error={error}
            instance={instance} fieldListingProps={fieldListingProps} />
    );
};