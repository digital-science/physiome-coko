import React, { useState, useMemo, useEffect } from 'react';

import useGetInstanceQuery from './../queries/getInstance';
import useUpdateInstance from './../mutations/updateInstance';

import resolveFieldsForFormElements from './../utils/resolveFieldsForFormElements';

import FieldRegistry from './../components/registry';
import TaskFormData from "../utils/TaskFormData";

import pick from "lodash/pick";
import debounce from "lodash/debounce";



export default function useEditorInstanceData({instanceId, instanceType, layoutDefinition, workflowDescription, wasSubmitted,
                                               enableAutoSave=true, displayIsSavingMessage=null, removeIsSavingMessage=null,
                                               autoSaveDebounceInterval=2000}) {


    const { fetchFields, topLevelFields } = useMemo(() => {
        return resolveFieldsForFormElements(layoutDefinition.elements, instanceType, FieldRegistry);
    }, [layoutDefinition, instanceType]);

    const { data, error, loading, refetch } = useGetInstanceQuery(instanceId, instanceType, workflowDescription, fetchFields);

    const updateInstance = useUpdateInstance(instanceType);

    const [formData, setFormData] = useState(null);


    function saveFormData() {

        if(!formData) {
            return Promise.resolve();
        }

        const modifiedDataSet = formData.getModifiedData();
        if(!modifiedDataSet) {
            return formData.updateModifiedRelationshipsForInstance(instanceId, instanceType);
        }

        const {data} = modifiedDataSet;
        const input = {
            id: instanceId,
            ...data
        };

        // FIXME: need to filter updated data based on the allowed input for the data type

        return Promise.all([
            updateInstance(input).then(() => {
                formData.updateForSubmittedModifications(modifiedDataSet);
            }),

            formData.updateModifiedRelationshipsForInstance(instanceId, instanceType)
        ]);
    }

    const refetchFormData = () => {
        return refetch();
    };


    useEffect(() => {

        // Upon receiving the initial data set, pick the top level fields from the data set and initialise a
        // new form data set with these initial values.

        setFormData(new TaskFormData(pick(data.result, topLevelFields)));

    }, [data]);


    useEffect(() => {

        if(!formData) {
            return;
        }

        const formDataWasChanged = debounce(() => {

            const t = displayIsSavingMessage ? displayIsSavingMessage() : null;

            saveFormData().then(() => {

                if(displayIsSavingMessage && removeIsSavingMessage) {
                    removeIsSavingMessage(t);
                }

            }).catch(err => {

                if(displayIsSavingMessage && removeIsSavingMessage) {
                    removeIsSavingMessage(t, true);
                }
                console.error(`Unable to save form data due to: ` + err.toString());
            });

        }, autoSaveDebounceInterval);

        formData.on('modified', formDataWasChanged);

        return (() => {
            formData.off('modified', formDataWasChanged);
            formDataWasChanged.cancel();
        });

    }, [formData, autoSaveDebounceInterval]);

    const instance = data ? data.result : null;
    const tasks = (data && data.result) ? data.result.tasks : null;

    return {
        fetchFields,
        topLevelFields,

        data,
        error,
        loading,

        instance,
        tasks,

        formData,
        saveFormData,
        refetchFormData,

        fieldRegistry:FieldRegistry
    };
};