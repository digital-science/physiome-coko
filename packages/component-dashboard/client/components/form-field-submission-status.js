import React from 'react';
import styled from 'styled-components';

import { withFormField, useFormValueBinding } from 'component-task-form/client';

import {BlockLabel} from 'ds-awards-theme/components/label';

import SubmissionStatusPill from './submission-status-pill'


function FormFieldSubmissionStatusPill({data, binding, options = {}}) {

    const [value] = useFormValueBinding(data, binding, "Pending");
    const [hidden] = useFormValueBinding(data, "hidden", false);
    const [curator] = useFormValueBinding(data, "curator", null);

    return (
        <FormFieldSubmissionStatusHolder>
            {options.label ? <BlockLabel>{options.label}</BlockLabel> : null}
            <div>
                <SubmissionStatusPill phase={value} curator={curator} onHold={hidden} />
            </div>
        </FormFieldSubmissionStatusHolder>
    );
}

const FormFieldSubmissionStatusHolder = styled.div`  
  margin-bottom: 15px;
`;

export default withFormField(FormFieldSubmissionStatusPill, function(element) {

    const topLevel = [element.binding, "hidden", "curator"];
    const fetch = {hidden:null};
    fetch[element.binding] = null;
    fetch.curator = {
        id: null,
        displayName: null
    };

    return {topLevel, fetch};

});