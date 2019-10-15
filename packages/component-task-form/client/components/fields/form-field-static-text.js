import React, { useMemo } from 'react';
import moment from 'moment';
import styled from 'styled-components';

import useFormValueBinding from './../../hooks/useFormValueBinding';
import withFormField from './withFormField'

import StaticText from 'ds-theme/components/static-text';
import {BlockLabel} from 'ds-theme/components/label';

const ISODateStringRegex = /(\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d\.\d+([+-][0-2]\d:[0-5]\d|Z))|(\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d([+-][0-2]\d:[0-5]\d|Z))|(\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d([+-][0-2]\d:[0-5]\d|Z))/;



function FormFieldStaticText({data, binding, options = {}, ...rest}) {

    const [value] = useFormValueBinding(data, binding, "");
    const { format = null, mapping = null, url = false } = options;

    // FIXME: an alternative to below, is allowing the binding to be resolved to a model field type directly and seeing if it is "DateTime".

    const transformedValue = useMemo(() => {

        if(mapping) {
            return mapping.mapping[value] || null;
        }

        if(value && typeof value ==="string" && value.match(ISODateStringRegex)) {
            const d = new Date(value);
            if (d !== "Invalid Date" && !isNaN(d)) {
                return moment(d).format(format || "MMM DD, YYYY");
            }
        }

        return (value !== null && value !== undefined) ? '' + value : null;

    }, [value, options, format, mapping]);

    if(url && transformedValue) {
        return (
            <FormFieldStaticTextHolder>
                {options.label ? <BlockLabel>{options.label}</BlockLabel> : null}
                <StaticText><a href={transformedValue} target="_blank" rel="noopener noreferrer">{transformedValue}</a></StaticText>
            </FormFieldStaticTextHolder>
        );
    }

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