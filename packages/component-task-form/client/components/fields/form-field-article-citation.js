import React from 'react';
import styled from 'styled-components';

import useFormValueBinding from './../../hooks/useFormValueBinding';
import withFormField from './withFormField'

import ArticleCitationEditorCard from '../article-citation-editor-card';
import { DisabledStaticText } from 'ds-theme/components/static-text';
import { BlockLabel } from 'ds-theme/components/label';
import ArticleCitation from './../article-citation';


const FormStyledArticleCitation = styled(ArticleCitation)`
  color: black !important;
`;


const FormFieldArticleCitation = ({data, binding, readOnly, options = {}}) => {

    const [citation, setCitation] = useFormValueBinding(data, binding, {});

    const didModifyCitation = (newCitation) => {
        setCitation(newCitation);
    };

    return (
        <React.Fragment>
            {options.label ? <BlockLabel>{options.label}</BlockLabel> : null}
            {options.readOnly
                ? (citation ? <FormStyledArticleCitation citation={citation} /> : <DisabledStaticText>No citation specified.</DisabledStaticText>)
                : <ArticleCitationEditorCard citation={citation} didModifyCitation={didModifyCitation} />
            }
        </React.Fragment>
    );
};

export default withFormField(FormFieldArticleCitation);