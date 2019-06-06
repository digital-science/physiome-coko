import React from 'react';

import useViewInstanceData from './../hooks/useViewInstanceData';
import SideBySideHeroLayout from './side-by-side-hero-layout';


export default function SideBySideHeroInstanceView({ instanceId, instanceType, viewDefinition, workflowDescription }) {

    const {instance, tasks, error, loading, viewData, refetchViewData, fieldRegistry} = useViewInstanceData({instanceId, instanceType, viewDefinition, workflowDescription});
    const fieldListingProps = {fieldRegistry, data:viewData, refetchData:refetchViewData, tasks, instanceId, instanceType, workflowDescription};

    return <SideBySideHeroLayout elements={viewDefinition.elements} data={viewData} loading={loading} error={error}
        instance={instance} fieldListingProps={fieldListingProps} />;
};