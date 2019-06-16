import React, { useState } from 'react';
import styled from 'styled-components';

import Card from "ds-awards-theme/components/card";
import { SmallBlockLabel } from "ds-awards-theme/components/label";
import { SmallTextInput } from "ds-awards-theme/components/text-input";
import { SmallCheckBox, SmallCheckboxLabel } from "ds-awards-theme/components/checkbox-input";
import { FaTrashAlt } from 'react-icons/fa';

import AffiliationEditor from './affiliation-editor';



function useAuthorValueField(author, field, didModifyAuthor) {

    const [value, setValue] = useState(author[field] || "");

    const handleChange = (event) => {
        const v = event.target.value;
        setValue(v);
        author[field] = v;

        didModifyAuthor(author);
    };

    return [value, setValue, handleChange];
}

function useAuthorCheckboxField(author, field, didModifyAuthor) {

    const [value, setValue] = useState(author[field] || false);

    const handleChange = (event) => {
        const v = event.target.checked;
        setValue(v);
        author[field] = v;

        didModifyAuthor(author);
    };

    return [value, setValue, handleChange];
}


const AuthorFormGroup = styled.div`
  margin-bottom: 8px;
`;


const AuthorSimpleFormGroup = styled(({className, label, value, onChange, placeholder}) => {

    return (
        <AuthorFormGroup className={className}>
            <SmallBlockLabel>{label}</SmallBlockLabel>
            <SmallTextInput value={value} onChange={onChange} placeholder={placeholder} />
        </AuthorFormGroup>
    );

})`
`;

const AuthorRelationshipFormGroup = styled(AuthorFormGroup)`
  
  & .holder {
    margin-top: 3px;
  }
  
  & .holder ${SmallCheckboxLabel} {
    margin-right: 10px;
  }
`;

const AuthorAffiliationsFormGroup = styled(AuthorFormGroup)`
`;


const AuthorEditorRemove = styled(({className, author, removeAuthor}) => {

    return <div className={className || ""}><FaTrashAlt onClick={() => removeAuthor(author)} /></div>
})`
    width: 1em;
    height: 1em;
    color: #b3b3b3;
    position: absolute;
    right: 0;
    bottom: 5px;
    font-size: 12px;
    cursor: pointer;
  
    &:hover {
        color: #505050;
    }
`;


function _AuthorEditorCard({className, author, removeAuthor, didModifyAuthor}) {

    const [name, setName, handleNameChange] = useAuthorValueField(author, "name", didModifyAuthor);
    const [email, setEmail, handleEmailChange] = useAuthorValueField(author, "email", didModifyAuthor);
    const [orcid, setOrcid, handleOrcidChange] = useAuthorValueField(author, "orcid", didModifyAuthor);
    const [corresponding, setCorresponding, handleCorrespondingChange] = useAuthorCheckboxField(author, "isCorresponding", didModifyAuthor);

    const [primaryPaperAuthor, setPrimaryPaperAuthor, handlePrimaryPaperAuthorChange] = useAuthorCheckboxField(author, "isPrimaryPaperAuthor", didModifyAuthor);
    const [developedModel, setDevelopedModel, handleDevelopedModelChange] = useAuthorCheckboxField(author, "didDevelopModel", didModifyAuthor);

    const [affiliations, setAffiliations] = useState((author && author.affiliations) ? author.affiliations : []);

    const onAffiliationsChanged = (affiliations) => {
        if(affiliations && affiliations.length) {
            author.affiliations = affiliations.filter(a => a && a.organization);
        } else {
            delete author.affiliations;
        }
        didModifyAuthor(author);

        setAffiliations(affiliations);
    };

    return (
        <Card className={className} reorderingGrabber={true}>
            <AuthorSimpleFormGroup label={"Name"} value={name} onChange={handleNameChange} />
            <AuthorSimpleFormGroup label={"Email"} value={email} onChange={handleEmailChange} />
            <AuthorSimpleFormGroup label={"ORCID"} value={orcid} onChange={handleOrcidChange} />
            <AuthorRelationshipFormGroup>
                <SmallBlockLabel>Relationships</SmallBlockLabel>
                <div className="holder">
                    <SmallCheckboxLabel><SmallCheckBox checked={corresponding} onChange={handleCorrespondingChange} />Corresponding Author</SmallCheckboxLabel>
                    <SmallCheckboxLabel><SmallCheckBox checked={primaryPaperAuthor} onChange={handlePrimaryPaperAuthorChange} />Author on Primary Paper</SmallCheckboxLabel>
                    <SmallCheckboxLabel><SmallCheckBox checked={developedModel} onChange={handleDevelopedModelChange} />Developed Reproducible Model</SmallCheckboxLabel>
                </div>
            </AuthorRelationshipFormGroup>
            <AuthorAffiliationsFormGroup>
                <SmallBlockLabel>Affiliations</SmallBlockLabel>
                <AffiliationEditor value={affiliations} onChange={onAffiliationsChanged} />
            </AuthorAffiliationsFormGroup>
            <AuthorEditorRemove author={author} removeAuthor={removeAuthor} />
        </Card>
    )
}

export default styled(_AuthorEditorCard)`
    
    & .content {
        position: relative;
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        flex-wrap: wrap;
    }
    
    & .content ${AuthorFormGroup} {
        flex-basis: calc(50% - 10px);
    }
    
    & .content ${AuthorRelationshipFormGroup} {
        flex-basis: calc(100%);
    }
        
    & .content ${AuthorAffiliationsFormGroup} {
        flex-basis: calc(100%);
    }

    & .content ${AuthorFormGroup} > ${SmallCheckboxLabel} {
        display: block;
        margin-top: 5px;
    }
`;
