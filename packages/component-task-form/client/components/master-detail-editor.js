import React from 'react';

import useTimedMinimumDisplay from './../hooks/useTimedMinimumDisplay';
import useEditorInstanceData from './../hooks/useEditorInstanceData';

import MasterDetailLayout from './master-detail-layout';


export default function MasterDetailEditor({ instanceId, instanceType, layoutDefinition, workflowDescription, wasSubmitted, dataContextRef=null, autoSave=true }) {

    // Editors: support changing data, but does not have an associated task which has defined outcomes.


    const [showIsSaving, displayIsSavingMessage, removeIsSavingMessage] = useTimedMinimumDisplay(1500);

    const fd = useEditorInstanceData({instanceId, instanceType, layoutDefinition, workflowDescription, wasSubmitted,
                                      autoSave, displayIsSavingMessage, removeIsSavingMessage});

    const { instance, error, loading, formData, saveFormData, refetchFormData, tasks, fieldRegistry } = fd;

    const fieldListingProps = {fieldRegistry, data:formData, saveData:saveFormData, refetchData:refetchFormData, tasks, instanceId, instanceType};
    if(dataContextRef) {
        dataContextRef.current = fieldListingProps;
    }

    return (
        <MasterDetailLayout elements={layoutDefinition.elements} data={formData} loading={loading} error={error}
            instance={instance} fieldListingProps={fieldListingProps} />
    );
};