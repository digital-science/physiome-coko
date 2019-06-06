import React, { useState, useMemo, useEffect } from 'react';

import useGetInstanceQuery from './../queries/getInstance';

import resolveFieldsForFormElements from './../utils/resolveFieldsForFormElements';

import FieldRegistry from './../components/registry';
import InstanceViewData from "../utils/InstanceViewData";

import pick from "lodash/pick";


export default function useViewInstanceData({instanceId, instanceType, viewDefinition, workflowDescription}) {


    const { fetchFields, topLevelFields } = useMemo(() => {
        return resolveFieldsForFormElements(viewDefinition.elements, instanceType, FieldRegistry);
    }, [viewDefinition, instanceType]);

    const { data, error, loading, refetch } = useGetInstanceQuery(instanceId, instanceType, workflowDescription, fetchFields);

    const [viewData, setViewData] = useState(null);


    const refetchViewData = () => {
        return refetch();
    };


    useEffect(() => {

        // Upon receiving the initial data set, pick the top level fields from the data set and initialise a
        // new form data set with these initial values.

        setViewData(new InstanceViewData(pick(data.result, topLevelFields)));

    }, [data]);

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

        viewData,
        refetchViewData,

        fieldRegistry:FieldRegistry
    };
};