import React from 'react';

import useFormValueBinding from './../../hooks/useFormValueBinding';
import withFormField from './withFormField'

import ArticleCitationEditorCard from '../article-citation-editor-card';
import {BlockLabel} from 'ds-awards-theme/components/label';



const FormFieldArticleCitation = ({data, binding, options = {}}) => {

    const [citation, setCitation] = useFormValueBinding(data, binding, {});

    const didModifyCitation = (newCitation) => {
        setCitation(newCitation);
    };

    return (
        <React.Fragment>
            {options.label ? <BlockLabel>{options.label}</BlockLabel> : null}
            <ArticleCitationEditorCard citation={citation} didModifyCitation={didModifyCitation} />
        </React.Fragment>
    );
};

export default withFormField(FormFieldArticleCitation);