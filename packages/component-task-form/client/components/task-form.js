import React from 'react';
import Spinner from 'ds-theme/components/spinner';

import useTimedMinimumDisplay from './../hooks/useTimedMinimumDisplay';
import useFormInstanceData from './../hooks/useFormInstanceData';

import FieldListing from './field-listing';


export default function TaskForm({ instanceId, taskId, taskName, instanceType, formDefinition, workflowDescription, wasSubmitted, autoSave=true }) {

    const [showIsSaving, displayIsSavingMessage, removeIsSavingMessage] = useTimedMinimumDisplay(1000);

    const fd = useFormInstanceData({instanceId, taskId, taskName, instanceType, formDefinition, workflowDescription, wasSubmitted,
                                    autoSave, displayIsSavingMessage, removeIsSavingMessage});
    const {instance, error, loading, task, resolvedTaskId, submitTaskOutcome, formData, refetchData, fieldRegistry} = fd;

    if(loading) {
        return <div>Loading</div>;
    }

    if(error) {
        return <div>Error: {error}</div>;
    }

    if(!instance) {
        return <div>Instance Not Found</div>
    }

    if(!task) {
        return <div>Task Not Found</div>
    }

    return formData ? (
        <div className="task-form" style={{padding: "20px", position:"relative", minWidth:"500px"}}>
            <div style={{position:'absolute', top:0, left: "500px", visibility:showIsSaving ? "visible" : "hidden"}}>
                <Spinner /> <span>Saving&hellip;</span>
            </div>

            <div>
                <FieldListing elements={formDefinition.elements} fieldRegistry={fieldRegistry} data={formData} refetchData={refetchData}
                    instanceId={instanceId} instanceType={instanceType} taskId={resolvedTaskId} submitTaskOutcome={submitTaskOutcome} />
            </div>
        </div>
    ) : (
        <div>Loading</div>
    );
};