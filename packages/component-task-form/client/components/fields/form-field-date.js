import React, { useState, useMemo } from 'react';
import useFormValueBinding from './../../hooks/useFormValueBinding';
import withFormField from './withFormField';
import moment from 'moment';

import Label from 'ds-awards-theme/components/label';
import DateInput from 'ds-awards-theme/components/date-input';


function FormFieldDate({data, binding, options = {}}) {

    const [value, setModelValue] = useFormValueBinding(data, binding, null);
    const [focused, setFocused] = useState(false);

    function onDateChanged(date) {
        setModelValue(date ? date.toDate() : null);
    }

    function valueToDate(value) {
        return value ? moment(new Date(value)) : null;
    }

    return (
        <React.Fragment>
            {options.label ? <Label>{options.label}</Label> : null}
            <DateInput
                placeholder={options.placeholder}
                date={valueToDate(value)}
                onDateChange={onDateChanged}
                focused={focused}
                onFocusChange={({focused}) => setFocused(focused)}
                small={true}
                displayFormat={"DD/MM/YYYY"}
            />
        </React.Fragment>
    );
}

export default withFormField(FormFieldDate);