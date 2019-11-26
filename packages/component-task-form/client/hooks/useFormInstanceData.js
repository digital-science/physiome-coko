import React, { useState, useMemo, useEffect } from 'react';

import useSubmitTaskOutcome, { SubmitTaskFailureReason } from './useSubmitTaskOutcome';

import useGetInstanceQuery from './../queries/getInstance';
import useUpdateInstance from './../mutations/updateInstance';

import resolveFieldsForFormElements from './../utils/resolveFieldsForFormElements';

import FieldRegistry from './../components/registry';
import TaskFormData from "../utils/TaskFormData";
import FormValidator from '../utils/FormValidator';

import pick from "lodash/pick";
import debounce from "lodash/debounce";


/* Hook that does the heavy lifting when setting up a form. It will resolve the set of data fields required to display
 * the form (this includes any complex objects with sub-fields etc). When a listing of fields is obtained it will
 * then fetch the instance data from the GraphQL endpoint.
 * The hook then configures updating the instance (via another GraphQL endpoint) when form data has been changed. Automatic
 * updates (debounced) can also be configured, with UI notifications of updates available via the "SavingMessage" related
 * callbacks provided from the hook.
 * */


export default function useFormInstanceData({instanceId, taskId, taskName, instanceType, formDefinition, workflowDescription,
                                             submitDidFail, wasSubmitted, enableAutoSave=true, displayIsSavingMessage=null,
                                             removeIsSavingMessage=null}) {

    const { fetchFields, topLevelFields } = useMemo(() => {
        return resolveFieldsForFormElements(formDefinition.elements, instanceType, FieldRegistry);
    }, [formDefinition, instanceType]);

    const { data, error, loading, refetch } = useGetInstanceQuery(instanceId, instanceType, workflowDescription, fetchFields);

    const updateInstance = useUpdateInstance(instanceType);

    const [formData, setFormData] = useState(null);
    const [formValidator] = useState(new FormValidator());

    const allowedInputFields = useMemo(() => {
        return instanceType ? instanceType.model.inputFields().map(f => f.field) : [];
    }, [instanceType]);


    function _validateForm() {
        return formData ? formValidator.validate(formData) : true;
    }
    
    function _getBlockingProcesses() {
        return formData ? formValidator.blockingProcesses : null;
    }

    function _updateInstanceFromFormData() {

        if(!formData) {
            return Promise.resolve();
        }

        const modifiedDataSet = formData.getModifiedData();
        if(!modifiedDataSet) {
            return formData.updateModifiedRelationshipsForInstance(instanceId, instanceType);
        }

        const { data } = modifiedDataSet;
        const pickedData = pick(data, allowedInputFields);

        const input = {
            id: instanceId,
            ...pickedData
        };

        if(!Object.keys(pickedData).length) {
            return formData.updateModifiedRelationshipsForInstance(instanceId, instanceType);
        }

        return Promise.all([
            updateInstance(input).then(() => {
                formData.updateForSubmittedModifications(modifiedDataSet);
            }),

            formData.updateModifiedRelationshipsForInstance(instanceId, instanceType)
        ]);
    }

    const submitTaskOutcome = useSubmitTaskOutcome(instanceId, formDefinition, instanceType, _updateInstanceFromFormData, 
                                                   _validateForm, submitDidFail, wasSubmitted, _getBlockingProcesses);

    const refetchFormData = () => {
        return refetch();
    };


    useEffect(() => {

        // Upon receiving the initial data set, pick the top level fields from the data set and initialise a
        // new form data set with these initial values.

        setFormData(new TaskFormData(pick(data.result, topLevelFields)));

    }, [data]);


    useEffect(() => {

        if(!formData || enableAutoSave !== true) {
            return;
        }

        const formDataWasChanged = debounce(() => {

            const t = displayIsSavingMessage ? displayIsSavingMessage() : null;

            _updateInstanceFromFormData().then(() => {

                if(displayIsSavingMessage && removeIsSavingMessage) {
                    removeIsSavingMessage(t);
                }

            }).catch(err => {

                if(displayIsSavingMessage && removeIsSavingMessage) {
                    removeIsSavingMessage(t, true);
                }
                console.error(`Unable to save form data due to: ` + err.toString());
            });

        }, 2000);

        formData.on('modified', formDataWasChanged);

        return (() => {
            formData.off('modified', formDataWasChanged);
            formDataWasChanged.cancel();
        });

    }, [formData]);

    const instance = data ? data.result : null;
    const tasks = (data && data.result) ? data.result.tasks : null;

    let resolvedTaskId = taskId;
    let task = null;

    if(tasks && tasks.length) {
        if(taskId) {
            task = tasks.find(t => t.id === taskId);
        } else if(taskName) {
            const customTaskName = `custom:${taskName}`;
            task = tasks.find(t => t.formKey === taskName || t.formKey === customTaskName);
        }
    }

    if(task) {
        resolvedTaskId = task.id;
    }

    return {
        fetchFields,
        topLevelFields,

        data,
        error,
        loading,

        instance,
        task,
        resolvedTaskId,

        tasks,

        submitTaskOutcome,
        formData,
        formValidator,
        refetchFormData,

        fieldRegistry:FieldRegistry
    };
};

export { SubmitTaskFailureReason };