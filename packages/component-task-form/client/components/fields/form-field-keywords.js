import React, { useState } from 'react';
import useFormValueBinding from './../../hooks/useFormValueBinding';
import withFormField from './withFormField'
import styled from 'styled-components';

import Label from 'ds-awards-theme/components/label';
import TagInput from 'ds-awards-theme/components/tag-input';

function _FormFieldKeywords({data, binding, options = {}}) {

    const [value, setValue] = useFormValueBinding(data, binding, []);

    return (
        <React.Fragment>
            {options.label ? <Label>{options.label}</Label> : null}
            <TagInput value={value} onChange={setValue} placeholder={options.placeholder} />
        </React.Fragment>
    );
}

const FormFieldKeywords = styled(withFormField(_FormFieldKeywords))`
`;



/*
 */

export default FormFieldKeywords;