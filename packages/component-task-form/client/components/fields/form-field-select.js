import React, { useMemo } from 'react';
import useFormValueBinding from './../../hooks/useFormValueBinding';
import withFormField from './withFormField'
import styled from 'styled-components';

import SelectInput from 'ds-awards-theme/components/select-input';
import Label from 'ds-awards-theme/components/label';

function FormFieldSelect({data, binding, options = {}}) {

    const [value, _, handleInputChange] = useFormValueBinding(data, binding, "", (v) => v || "");

    const optValues = useMemo(() => {

        if(!options.options) {
            return [];
        }

        const mapping = options.options.values;
        if(!mapping) {
            return [];
        }

        return Object.keys(mapping).map(k => {
            return {value:k, display:mapping[k]};
        });

    }, [options, options.values]);

    const selectInput = <SelectInput value={value || ""} placeholder={options.placeholder} onChange={handleInputChange} options={optValues} />;

    return (
        <React.Fragment>
            {options.label ? <Label>{options.label}</Label> : null}
            {selectInput}
        </React.Fragment>
    );
}




/*
 */

export default styled(withFormField(FormFieldSelect))`

  > select {
       width: auto;
       display: block;
       min-width: 33%;
       border: 1px solid #b1b1b1;
       background: white;
       margin-top: 4px;
  }

`;