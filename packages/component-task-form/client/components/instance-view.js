import React from 'react';
//import Spinner from 'ds-theme/components/spinner';

import useViewInstanceData from './../hooks/useViewInstanceData';

import FieldListing from './field-listing';


export default function InstanceView({ instanceId, instanceType, viewDefinition, workflowDescription }) {

    const {instance, tasks, error, loading, viewData, refetchViewData, fieldRegistry} = useViewInstanceData({instanceId, instanceType, viewDefinition});

    if(loading) {
        return <div>Loading</div>;
    }

    if(error) {
        return <div>Error: {error}</div>;
    }

    if(!instance) {
        return <div>Instance Not Found</div>
    }

    const fieldListingProps = {fieldRegistry, data:viewData, refetchData:refetchViewData, tasks, instanceId, instanceType, workflowDescription};

    console.log("----- InstanceView -----");
    console.dir(fieldListingProps);
    console.log("");

    return viewData ? (
        <div className="task-view">
            <div>
                <FieldListing elements={viewDefinition.elements} {...fieldListingProps} />
            </div>
        </div>
    ) : (
        <div>Loading</div>
    );
};