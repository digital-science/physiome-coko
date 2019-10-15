import React, { useMemo } from 'react';
import styled from 'styled-components';

import FieldListing from '../field-listing';

import withFormField from './withFormField'

import Card, { CardContent } from 'ds-theme/components/card';
import { BlockLabel } from 'ds-theme/components/label';


function FormFieldGroup({className, description, options = {}, ...rest}) {

    return (
        <FormFieldGroupHolder className={className}>
            {options.heading ? <BlockLabel>{options.heading}</BlockLabel> : null}
            {description.children ? (
                <Card simple={true}>
                    <FieldListing elements={description.children} {...rest} />
                </Card>
            ) : null}
        </FormFieldGroupHolder>
    );
}

const FormFieldGroupHolder = styled.div`

   & > ${Card} > ${CardContent} {
    padding: 10px 10px;
    box-sizing: border-box;
   }
   
   & > ${Card} > ${CardContent} > ${FieldListing} .form-field:last-child {
    margin-bottom: 0;
   }  
`;

export default withFormField(FormFieldGroup);