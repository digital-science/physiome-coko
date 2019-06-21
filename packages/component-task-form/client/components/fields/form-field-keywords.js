import React, { useState } from 'react';
import useFormValueBinding from './../../hooks/useFormValueBinding';
import withFormField from './withFormField'
import styled from 'styled-components';

import Label from 'ds-awards-theme/components/label';
import TagInput from 'ds-awards-theme/components/tag-input';

import { th } from 'ds-awards-theme';


function _FormFieldKeywordsEditor({data, binding, options = {}}) {

    const [value, setValue] = useFormValueBinding(data, binding, []);

    return (
        <React.Fragment>
            {options.label ? <Label>{options.label}</Label> : null}
            <TagInput value={value} onChange={setValue} placeholder={options.placeholder} />
        </React.Fragment>
    );
}

const FormFieldKeywordsEditor = styled(withFormField(_FormFieldKeywordsEditor))`
`;


// ----
// Listing (view only)
// ----

function _FormFieldKeywordsListing({className, data, binding, options = {}}) {

    const [value] = useFormValueBinding(data, binding, []);

    return (
        <div className={className}>
            {options.label ? <Label>{options.label}</Label> : null}
            {value && value instanceof Array && value.length ? (
                <ol>
                    {value.map((tag, index) =>
                        <li key={index}>{tag}</li>
                    )}
                </ol>
            ) : <div className="empty">No keywords supplied</div>
            }
        </div>
    );
}

const FormFieldKeywordsListing = styled(withFormField(_FormFieldKeywordsListing))`

  font-family: ${th('tagInput.fontFamily')};
  font-size: 14px;

  & ol {
    list-style: none;
    margin: 0;
    padding: 0;
  }
  & ol li {
    display: inline-block;
    padding: 2px 5px;
    border: 1px solid #505050;
    background: #909090;
    color: white;
    border-radius: 5px;
  }
  div.empty {
    color: #b3b3b3;
  }
`;





export default FormFieldKeywordsEditor;

export { FormFieldKeywordsListing };

