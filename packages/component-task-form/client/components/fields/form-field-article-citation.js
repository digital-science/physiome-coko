import React from 'react';
import styled from 'styled-components';

import useFormValueBinding from './../../hooks/useFormValueBinding';
import withFormField from './withFormField'

import ArticleCitationEditorCard from '../article-citation-editor-card';
import {BlockLabel} from 'ds-awards-theme/components/label';
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
            {options.readOnly ? <FormStyledArticleCitation citation={citation} /> : <ArticleCitationEditorCard citation={citation} didModifyCitation={didModifyCitation} />}
        </React.Fragment>
    );
};

export default withFormField(FormFieldArticleCitation);