import React, { useMemo } from 'react';
import styled from 'styled-components';

import FieldListing from '../field-listing';

import withFormField from './withFormField'

import {BlockLabel} from 'ds-theme/components/label';


function FormFieldGroup({className, description, options = {}, ...rest}) {

    return (
        <FormFieldGroupHolder className={className}>
            {options.heading ? <BlockLabel>{options.heading}</BlockLabel> : null}
            {description.children ? (
                <div>
                    <FieldListing elements={description.children} {...rest} />
                </div>
            ) : null}
        </FormFieldGroupHolder>
    );
}

const FormFieldGroupHolder = styled.div`  
    
    padding: 10px 15px;
    border: 1px solid #adadad;
    border-radius: 5px;
    background: #f9f9f9;

    margin-bottom: 15px;
    
    & > label {
        padding: 10px 15px;
        background: #adadad;
        color: white;
        margin: -10px -15px 20px;
    }
`;

export default withFormField(FormFieldGroup);