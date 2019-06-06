import React, { useMemo } from 'react';
import moment from 'moment';
import styled from 'styled-components';

import useFormValueBinding from './../../hooks/useFormValueBinding';
import withFormField from './withFormField'

import StaticText from 'ds-awards-theme/components/static-text';
import {BlockLabel} from 'ds-awards-theme/components/label';


function FormFieldStaticText({data, binding, options = {}}) {

    const [value] = useFormValueBinding(data, binding, "");

    const transformedValue = useMemo(() => {
        const d = new Date(value);
        if(d !== "Invalid Date" && !isNaN(d)) {
            return moment(d).format(options.format || "MMM DD, YYYY");
        }
        return (value !== null && value !== undefined) ? '' + value : null;
    }, [value]);

    return (
        <FormFieldStaticTextHolder>
            {options.label ? <BlockLabel>{options.label}</BlockLabel> : null}
            <StaticText>{transformedValue || <EmptyValuePlaceholder>-</EmptyValuePlaceholder>}</StaticText>
        </FormFieldStaticTextHolder>
    );
}

const EmptyValuePlaceholder = styled.span`
  color: darkgrey;
`;

const FormFieldStaticTextHolder = styled.div`  
  margin-bottom: 15px;
`;

export default withFormField(FormFieldStaticText);