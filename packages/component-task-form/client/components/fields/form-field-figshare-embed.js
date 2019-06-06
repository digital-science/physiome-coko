import React, { useMemo } from 'react';
import styled from 'styled-components';

import useFormValueBinding from './../../hooks/useFormValueBinding';
import withFormField from './withFormField'

import {BlockLabel} from 'ds-awards-theme/components/label';


function FormFieldFigshareEmbed({data, binding, options = {}}) {

    const [articleId] = useFormValueBinding(data, binding, "");

    const iframeUrl = useMemo(() => {

        if(!articleId) {
            return null;
        }
        return `https://widgets.figsh.com/articles/${encodeURI(articleId)}/embed?show_title=1`;

    }, [articleId]);

    return (
        <FormFieldFigshareEmbedHolder>
            {options.label ? <BlockLabel>{options.label}</BlockLabel> : null}
            <iframe src={iframeUrl} />
        </FormFieldFigshareEmbedHolder>
    );
}

const FormFieldFigshareEmbedHolder = styled.div`  
  margin-bottom: 15px;
  
  > iframe {
    margin-top: 5px;
  
    width: 100%;
    height: 450px;
    
    border: 1px solid #a2a2a2;
    box-shadow: #d6d6d6 1px 1px 8px 0;
  }
`;

export default withFormField(FormFieldFigshareEmbed);