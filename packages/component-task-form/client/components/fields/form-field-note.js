import React from 'react';
import styled from 'styled-components';

import withFormField from './withFormField'

import { NoteStaticText } from 'ds-theme/components/static-text';
import { BlockLabel } from 'ds-theme/components/label';


function FormFieldNote({data, binding, options = {}, ...rest}) {

    const { message } = options;

    return (
        <FormFieldNoteHolder>
            {options.label ? <BlockLabel>{options.label}</BlockLabel> : null}
            <NoteStaticText dangerouslySetInnerHTML={{__html: message}} />
        </FormFieldNoteHolder>
    );
}

const FormFieldNoteHolder = styled.div`  
`;

export default withFormField(FormFieldNote);