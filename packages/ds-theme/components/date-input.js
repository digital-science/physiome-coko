import React, { useMemo } from 'react';
import styled from 'styled-components';
//import BorderedInput from './bordered-input';

import 'react-dates/initialize';
import 'react-dates/lib/css/_datepicker.css';
import './date-input.css';

import { SingleDatePicker, CalendarDay } from 'react-dates';

let DATE_PICKER_ID = 1;


const _DateInput = ({className, placeholder, displayFormat, showClearDate, numberOfMonths,
    hideKeyboardShortcutsPanel, showDefaultInputIcon, small, appendToBody, disableScroll, ...rest}) => {

    const pickerID = useMemo(() => {
        return DATE_PICKER_ID++;
    });

    const safeModifiers = modifiers => {
        return (modifiers instanceof Set) ? modifiers : new Set()
    };

    return <div className={className}><SingleDatePicker
        placeholder={placeholder || "DD/MM/YYYY"}
        id={"ds_awards_date_input_" + pickerID}
        hideKeyboardShortcutsPanel={hideKeyboardShortcutsPanel !== undefined ? hideKeyboardShortcutsPanel : true}
        numberOfMonths={numberOfMonths !== undefined ? numberOfMonths : 1}
        showDefaultInputIcon={showDefaultInputIcon !== undefined ? showDefaultInputIcon : true}
        small={small !== undefined ? small : true}
        showClearDate={showClearDate !== undefined ? showClearDate : true}
        enableOutsideDays={false}
        isOutsideRange={() => { return false; }}
        displayFormat={displayFormat || "DD/MM/YYYY"}
        appendToBody={appendToBody !== undefined ? appendToBody : true}
        disableScroll={disableScroll !== undefined ? disableScroll : true}
        renderCalendarDay={({ modifiers, ...props }) => {
            return <CalendarDay modifiers={safeModifiers(modifiers)} {...props} />
        }}
        {...rest}
    /></div>;

};



const DateInput = styled(_DateInput)`

    .SingleDatePickerInput__withBorder {    
        border-radius: 5px;
        border: 1px solid #d0d0d0;
    }
    
    .DateInput_input__small {
        font-family: ProximaNovaLight, sans-serif;
    }
`;

export default DateInput;