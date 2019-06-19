import React from 'react';

import useTimedMinimumDisplay from './../hooks/useTimedMinimumDisplay';
import useFormInstanceData from './../hooks/useFormInstanceData';

import SideBySideHeroLayout from './side-by-side-hero-layout';


export default function SideBySideHeroTaskForm({ instanceId, taskId, taskName, instanceType, formDefinition, workflowDescription, wasSubmitted, autoSave=true }) {

    const [showIsSaving, displayIsSavingMessage, removeIsSavingMessage] = useTimedMinimumDisplay(1500);

    const fd = useFormInstanceData({instanceId, taskId, taskName, instanceType, formDefinition, workflowDescription, wasSubmitted,
                                    autoSave, displayIsSavingMessage, removeIsSavingMessage});
    const {instance, error, loading, resolvedTaskId, submitTaskOutcome, formData, refetchFormData, fieldRegistry} = fd;

    const fieldListingProps = {fieldRegistry, data:formData, refetchData:refetchFormData, instanceId, instanceType, taskId:resolvedTaskId, submitTaskOutcome};

    return (
        <SideBySideHeroLayout elements={formDefinition.elements} data={formData} loading={loading} error={error}
            instance={instance} fieldListingProps={fieldListingProps} />
    );

};