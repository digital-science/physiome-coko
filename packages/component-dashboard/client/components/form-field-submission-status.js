import React from 'react';
import styled from 'styled-components';

import { withFormField, useFormValueBinding } from 'component-task-form/client';

import {BlockLabel} from 'ds-awards-theme/components/label';

import SubmissionStatusPill from './submission-status-pill'


function FormFieldSubmissionStatusPill({data, binding, options = {}}) {

    const [value] = useFormValueBinding(data, binding, "Pending");

    return (
        <FormFieldSubmissionStatusHolder>
            {options.label ? <BlockLabel>{options.label}</BlockLabel> : null}
            <div>
                <SubmissionStatusPill phase={value} />
            </div>
        </FormFieldSubmissionStatusHolder>
    );
}

const FormFieldSubmissionStatusHolder = styled.div`  
  margin-bottom: 15px;
`;

export default withFormField(FormFieldSubmissionStatusPill);