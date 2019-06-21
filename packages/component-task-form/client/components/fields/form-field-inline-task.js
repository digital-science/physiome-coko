import React, { useMemo, useEffect } from 'react';
import styled from 'styled-components';
import debounce from "lodash/debounce";

import useUpdateInstance from '../../mutations/updateInstance';
import useSubmitTaskOutcome from "../../hooks/useSubmitTaskOutcome";

import withFormField from './withFormField'

import FieldListing from '../field-listing';
import {BlockLabel} from 'ds-awards-theme/components/label';

import ShadowedTaskFormData from '../../utils/ShadowedTaskFormData';
import resolveFieldsForFormElements from "../../utils/resolveFieldsForFormElements";



const InlineTaskContext = { content: "InlineTask" };
export { InlineTaskContext };



// If the higher level context supports saving form data back to the instance, then we use that. Otherwise
// we setup a new "update instance" mutation and utilise that.

function useInlineFormData(instanceId, instanceType, data, saveData, topLevelFields, autoSaveDebounceInterval=2000) {

    if(saveData && data && data.supportsUpdates()) {
        return [data, saveData];
    }

    const formData = useMemo(() => {
        return new ShadowedTaskFormData(data, topLevelFields);
    }, [data, topLevelFields]);

    const updateInstance = useUpdateInstance(instanceType);

    function _updateInstanceFromFormData() {

        if(!formData) {
            return Promise.resolve();
        }

        const modifiedDataSet = formData.getModifiedData();
        if(!modifiedDataSet) {
            return Promise.resolve();
        }

        const {data} = modifiedDataSet;
        const input = {
            id: instanceId,
            ...data
        };

        return updateInstance(input).then(() => {
            formData.updateForSubmittedModifications(modifiedDataSet);
        });
    }

    useEffect(() => {

        if(!formData) {
            return;
        }

        const formDataWasChanged = debounce(() => {
            _updateInstanceFromFormData().then(() => {
            }).catch(err => {
                console.error(`Unable to save form data due to: ` + err.toString());
            });
        }, autoSaveDebounceInterval);

        formData.on('modified', formDataWasChanged);

        return (() => {
            formData.off('modified', formDataWasChanged);
            formDataWasChanged.cancel();
        });

    }, [formData, _updateInstanceFromFormData]);

    return [formData, _updateInstanceFromFormData];
}



/**
 * @return {null}
 */
function FormFieldInlineTask({className, description, data, instanceId, instanceType, fieldRegistry, saveData, refetchData, context = [], options = {}, tasks, ...rest}) {

    // Note: for this inline form, the GraphQL request has already fetched all the data required to
    // display the form inline. We need to create a custom "data" type that supports editing
    // and only reflects the top level fields of interest to this inline task.

    if(!tasks || !tasks.length) {
        return null;
    }

    const { form } = options;
    if(!form) {
        return null;
    }

    const formDefinition = instanceType.formDefinitionForFormName(form);
    if(!formDefinition) {
        return null;
    }

    const matchingTasks = tasks.filter(t => t.formKey === `custom:${form}`);
    if(!matchingTasks.length && options.tasks && options.tasks.length) {

        const allowedFormKeys = {};
        options.tasks.forEach(a => allowedFormKeys[`custom:${a}`] = true);

        tasks.forEach(t => {
            if(allowedFormKeys.hasOwnProperty(t.formKey)) {
                matchingTasks.push(t);
            }
        });
    }

    if(!matchingTasks.length) {
        return null;
    }

    const task = matchingTasks[0];

    const { topLevelFields } = useMemo(() => {
        return resolveFieldsForFormElements(formDefinition.elements, instanceType, fieldRegistry);
    }, [formDefinition, instanceType, fieldRegistry]);

    const [formData, inlineSaveData] = useInlineFormData(instanceId, instanceType, data, saveData, topLevelFields);

    const submitTaskOutcome = useSubmitTaskOutcome(instanceId, formDefinition, instanceType, inlineSaveData, () => {
        if(refetchData) {
            refetchData();
        }
    });


    const fieldListingProps = {
        data:formData,
        instanceId,
        taskId:task.id,
        tasks,
        instanceType,
        submitTaskOutcome,
        fieldRegistry,
        saveData:inlineSaveData,
        refetchData,
        context: [InlineTaskContext, ...context],
        ...rest
    };

    return (
        <FormFieldInlineTaskHolder className={className}>
            {options.label ? <BlockLabel>{options.label}</BlockLabel> : null}
            <FieldListing elements={formDefinition.elements} {...fieldListingProps} />
        </FormFieldInlineTaskHolder>
    );
}

const FormFieldInlineTaskHolder = styled.div`  
  margin-bottom: 15px;
  
  & > ${FieldListing} {
    margin-bottom: 0;
  }
`;


export default withFormField(FormFieldInlineTask, (element, instanceType, resolveForElements) => {

    if(!element || !instanceType) {
        return null;
    }

    const { form=null } = element.options;
    if(!form) {
        return null;
    }

    const formDef = instanceType.formDefinitionForFormName(form);

    if(formDef && formDef.elements) {
        resolveForElements(formDef.elements);
    }

    return null;
});

export { FormFieldInlineTaskHolder };