import { useEffect, useState } from "react";

export default function useFormValueBinding(formData, binding, initialState = null, valueTransformer = null) {

    const [value, setValue] = useState(formData.getFieldValue(binding) || initialState);
    const vt = (value) => {
        return valueTransformer ? valueTransformer(value) : value;
    };


    function formDataWasChanged(form, field, v) {
        setValue(vt(form.getFieldValue(field)));
    }

    function handleInputChange(e) {
        if(formData && binding) {
            const value = (e.target.type === 'checkbox') ? !!e.target.checked : e.target.value;
            formData.setFieldValue(binding, value);
        }
    }

    function setModelValue(newValue) {
        if(formData && binding) {
            formData.setFieldValue(binding, newValue);
        }
    }

    useEffect(() => {

        formData.on(`field.${binding}`, formDataWasChanged);
        setValue(formData.getFieldValue(binding));

        // Specify how to clean up after this effect:
        return function cleanup() {
            formData.off(`field.${binding}`, formDataWasChanged);
        };

    }, [formData, binding]);

    return [value, setModelValue, handleInputChange];
};



function useFormValueBindingForComplexObject(formData, binding, initialState = null) {

    const [value, setValue] = useState(formData.getFieldValue(binding) || initialState);

    function formDataWasChanged(form, field, v) {
        setValue(form.getFieldValue(field));
    }

    function setModelValue(newValue) {
        if(formData && binding) {
            formData.setFieldValueForComplexObject(binding, newValue);
        }
    }

    useEffect(() => {

        formData.on(`field.${binding}`, formDataWasChanged);
        setValue(formData.getFieldValue(binding));

        // Specify how to clean up after this effect:
        return function cleanup() {
            formData.off(`field.${binding}`, formDataWasChanged);
        };

    }, [formData, binding]);

    return [value, setModelValue];
}

export { useFormValueBindingForComplexObject };