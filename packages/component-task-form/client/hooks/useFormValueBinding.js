import { useEffect, useState } from "react";

export default function useFormValueBinding(formData, binding, initialState = null, valueTransformer = null) {

    const [value, setValue] = useState(formData.getFieldValue(binding) || initialState);
    const vt = (value) => {
        return valueTransformer ? valueTransformer(value) : value;
    };


    function formDataWasChanged(form, field, v) {
        console.log(`[hook] form data was changed: ${field} --> "${v}" `);
        setValue(vt(form.getFieldValue(field)));
    }

    function handleInputChange(e) {
        console.log(`[hook] handle input change!!" `);

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