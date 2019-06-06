import React, { useState, useEffect } from 'react';


export default function withFormFieldData(formData, binding, fallbackValue=null) {

    const [field, setField] = useState(fallbackValue);

    const formDataWasChanged = function _formDataWasChanged(form, field, v) {
        setField(formData.getFieldValue(field) || fallbackValue);
    };

    useEffect(() => {

        if(!formData || !binding) {
            return;
        }

        const simpleBinding = binding.split('.')[0];

        formData.on(`field.${simpleBinding}`, formDataWasChanged);
        setField(formData.getFieldValue(binding) || fallbackValue);

        return function cleanup() {
            formData.off(`field.${simpleBinding}`, formDataWasChanged);
        };

    }, [formData, binding]);

    return [field, setField];
};