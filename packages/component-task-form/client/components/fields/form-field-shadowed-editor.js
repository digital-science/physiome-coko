/**
 *  Shadowed Editor - a shadowed editor creates an independent "form data" instance from any defined above it in the
 *  view hierarchy. For initial data values it mirrors the supplied base form data (aka "data" property). Any form
 *  fields that make changes to values will apply these changes onto the shadowed version of the form data.
 *
 *  The shadow editor will modify the panel header (via the provided setPanelHeadingContent property) to show
 *  a "Save" and "Cancel" button. If the user clicks "Save" all of the shadowed changes are pushed back to the
 *  instance (via the useUpdateInstance mutation). The saved changes are then also applied back to the underlying
 *  form data's default values.
 */


import React, { useMemo, useState, useEffect } from 'react';
import styled from 'styled-components';

import withFormField from './withFormField'
import useUpdateInstance from './../../mutations/updateInstance';

import TaskFormData from '../../utils/TaskFormData';
import FieldListing from '../field-listing';

import { InlineButton } from 'ds-theme/components/inline-button';
import Label from 'ds-theme/components/label';
import pick from "lodash/pick";


class ShadowedFormData extends TaskFormData {

    constructor(formData) {
        super();
        this.underlyingFormData = formData;
    }

    _hasDefaultValue(fieldID) {
        return this.underlyingFormData._hasDefaultValue(fieldID);
    }

    _getDefaultValue(fieldID) {
        return this.underlyingFormData._getDefaultValue(fieldID);
    }

    _setDefaultValue(fieldID, value) {
        this.underlyingFormData._setDefaultValue(fieldID, value);
    }
}


const PanelHeadingModifiedContentHolder = styled.div`
  background: #dcf4ff;
  display: flex;
  justify-content: space-between;
  padding: 4px 10px;
  border-radius: 5px;
  align-items: center;
  
  > ${Label} + ${InlineButton} {
    margin-left: 10px;
  }

  > ${InlineButton} + ${InlineButton} {
    margin-left: 5px;
  }
  
  > ${InlineButton} {
    background: white;
  }
`;


const FormFieldShadowedEditor = ({className, instanceId, instanceType, description, binding, options={}, setPanelHeadingContent, dismissEditor, data, saveData, ...rest}) => {

    if(data && data.supportsUpdates() !== true) {
        throw Error(`FormFieldShadowedEditor requires the 'data' supplied to it to support updates. `);
    }

    const fieldListingProps = {...rest};
    const [isModified, setIsModified] = useState(false);
    const updateInstance = useUpdateInstance(instanceType);

    const allowedInputFields = useMemo(() => {
        return instanceType ? instanceType.model.inputFields().map(f => f.field) : [];
    }, [instanceType]);


    const shadowedFormData = useMemo(() => {
        return new ShadowedFormData(data);
    }, [data]);


    useEffect(() => {
        // Register for changes to the shadowed form data. When we detect changes we update the state indicating
        // that pending changes are present.

        if(isModified || !shadowedFormData) {
            return;
        }

        const onFormDataModified = () => {
            setIsModified(true);
        };
        shadowedFormData.on('modified', onFormDataModified);

        return () => {
            shadowedFormData.off('modified', onFormDataModified);
        };

    }, [shadowedFormData, isModified, setIsModified]);


    const shadowedSaveData = () => {

        if(!shadowedFormData) {
            return Promise.resolve();
        }

        const modifiedDataSet = shadowedFormData.getModifiedData();
        if(!modifiedDataSet) {
            return shadowedFormData.updateModifiedRelationshipsForInstance(instanceId, instanceType);
        }

        const { data:modfiedData } = modifiedDataSet;
        if(options.unpublishedChangesFlagField) {
            modfiedData[options.unpublishedChangesFlagField] = true;
        }

        const pickedData = pick(modfiedData, allowedInputFields);
        const input = {
            id: instanceId,
            ...pickedData
        };

        if(!Object.keys(pickedData).length) {
            return shadowedFormData.updateModifiedRelationshipsForInstance(instanceId, instanceType).then(() => {
                data.overlayValues(modfiedData);
                shadowedFormData.resetAllFields();
            });
        }

        return Promise.all([
            updateInstance(input),
            shadowedFormData.updateModifiedRelationshipsForInstance(instanceId, instanceType)
        ]).then(d => {
            data.overlayValues(modfiedData);
            shadowedFormData.resetAllFields();
        });
    };


    useEffect(() => {

        if(!setPanelHeadingContent) {
            return;
        }

        if(isModified) {
            const onCancelClicked = () => {
                setPanelHeadingContent(null);
                dismissEditor();
            };

            const onSaveClicked = () => {
                shadowedSaveData().then(() => {
                    setIsModified(false);
                    dismissEditor();
                });
            };

            setPanelHeadingContent(
                <PanelHeadingModifiedContentHolder>
                    <Label>Unsaved Changes</Label>
                    <InlineButton bordered={true} onClick={onCancelClicked}>Cancel</InlineButton>
                    <InlineButton bordered={true} onClick={onSaveClicked}>Save</InlineButton>
                </PanelHeadingModifiedContentHolder>
            );
        } else {
            setPanelHeadingContent(null);
        }

    }, [isModified, setIsModified, setPanelHeadingContent, dismissEditor]);


    return (
        <FieldListing className={className} elements={description.children} data={shadowedFormData} saveData={shadowedSaveData}
            instanceId={instanceId} instanceType={instanceType} {...fieldListingProps} />
    );
};


export default withFormField(FormFieldShadowedEditor);