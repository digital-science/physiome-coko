import React from 'react';
import useFormValueBinding from './../../hooks/useFormValueBinding';
import withFormField from './withFormField'

import TextInput from 'ds-awards-theme/components/text-input';
import Label from 'ds-awards-theme/components/label';

function FormFieldText({data, binding, options = {}}) {

    const [value, _, handleInputChange] = useFormValueBinding(data, binding, "", (v) => v || "");
    const textInput = <TextInput type="text" value={value || ""} onChange={handleInputChange} />;

    return (
        <React.Fragment>
            {options.label ? <Label>{options.label}</Label> : null}
            {textInput}
        </React.Fragment>
    );
}

export default withFormField(FormFieldText);