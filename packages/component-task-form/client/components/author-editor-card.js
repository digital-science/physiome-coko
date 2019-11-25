import React, { useState, useEffect, useMemo } from 'react';
import styled from 'styled-components';

import Card, { CardRemoveButton } from "ds-theme/components/card";
import { SmallBlockLabel } from "ds-theme/components/label";
import { SmallTextInput } from "ds-theme/components/text-input";
import { SmallCheckBox, SmallCheckboxLabel } from "ds-theme/components/checkbox-input";
import { SmallORCIDInput, isValidORCIDValue, checkORCIDChecksum } from "ds-theme/components/orcid-input";

import AffiliationEditor from './affiliation-editor';



function useAuthorValueField(author, field, didModifyAuthor, includeValidation) {

    const [value, setValue] = useState(author[field] || "");
    const [validationIssue, setValidationIssue] = includeValidation ? useState(false) : [null, null];

    const handleChange = (event) => {
        const v = event.target.value;
        setValue(v);
        author[field] = v;

        didModifyAuthor(author);
        if(setValidationIssue) {
            setValidationIssue(false);
        }
    };

    return [value, setValue, handleChange, validationIssue, setValidationIssue];
}

function useAuthorCustomValueField(author, field, didModifyAuthor, includeValidation) {

    const [value, setValue] = useState(author[field] || "");
    const [validationIssue, setValidationIssue] = includeValidation ? useState(false) : [null, null];

    const newSetValue = (v) => {
        setValue(v);
        author[field] = v;

        didModifyAuthor(author);
        if(setValidationIssue) {
            setValidationIssue(false);
        }
    };

    return [value, newSetValue, validationIssue, setValidationIssue];
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
  
  & > ${SmallBlockLabel}.error {
    margin-top: 4px;
    color: #d10f00;
  }
`;


const AuthorSimpleFormGroup = styled(({className, label, value, onChange, issue, issueMessage, placeholder}) => {

    return (
        <AuthorFormGroup className={className}>
            <SmallBlockLabel>{label}</SmallBlockLabel>
            <SmallTextInput value={value} onChange={onChange} placeholder={placeholder} issue={issue || false} />
            {(issue && issueMessage) ? <SmallBlockLabel className="error">{issueMessage}</SmallBlockLabel> : null}
        </AuthorFormGroup>
    );
})`
`;


const AuthorORCIDFormGroup = styled(({className, label, value, setValue, validValue, issue, issueMessage, setValidationIssue}) => {

    return (
        <AuthorFormGroup className={className}>
            <SmallBlockLabel>{label}</SmallBlockLabel>
            <SmallORCIDInput value={value} setValue={setValue} validValue={validValue} validationIssue={issue || false} setValidationIssue={setValidationIssue} />
            {(issue && issueMessage) ? <SmallBlockLabel className="error">{issueMessage}</SmallBlockLabel> : null}
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

const AuthorEditorRemove = ({className, author, removeAuthor}) => <CardRemoveButton className={className} onClick={() => removeAuthor(author)} />;


function _AuthorEditorCard({className, author, removeAuthor, formValidator, didModifyAuthor}) {

    const [name, setName, handleNameChange, nameValidationIssue, setNameValidationIssue] = useAuthorValueField(author, "name", didModifyAuthor, true);
    const [email, setEmail, handleEmailChange, emailValidationIssue, setEmailValidationIssue] = useAuthorValueField(author, "email", didModifyAuthor, true);
    const [orcid, setOrcid, orcidValidationIssue, setORCIDValidationIssue] = useAuthorCustomValueField(author, "orcid", didModifyAuthor, true);
    const [corresponding, setCorresponding, handleCorrespondingChange] = useAuthorCheckboxField(author, "isCorresponding", didModifyAuthor);

    const [primaryPaperAuthor, setPrimaryPaperAuthor, handlePrimaryPaperAuthorChange] = useAuthorCheckboxField(author, "isPrimaryPaperAuthor", didModifyAuthor);
    const [developedModel, setDevelopedModel, handleDevelopedModelChange] = useAuthorCheckboxField(author, "didDevelopModel", didModifyAuthor);

    const [affiliations, setAffiliations] = useState((author && author.affiliations) ? author.affiliations : []);

    const doesHaveName = (name && name.trim().length);
    const doesHaveValidEmail = (email && email.trim().length && email.match(/^\S+@\S+$/));
    const invalidORCIDValue = (orcid && orcid.length) ? !isValidORCIDValue(orcid) : false;
    const checksumMismatchORCIDValue = (orcid && orcid.length && !invalidORCIDValue) ? !checkORCIDChecksum(orcid) : false;
    const doesHaveValidORCID = orcid && orcid.length && !invalidORCIDValue && !checksumMismatchORCIDValue;

    const validationCallback = useMemo(() => {

        return (data) => {

            let r = true;

            if(!doesHaveName) {
                setNameValidationIssue(true);
                r = false;
            }

            if(corresponding && !doesHaveValidEmail) {
                setEmailValidationIssue(true);
                r = false;
            }

            if(invalidORCIDValue || checksumMismatchORCIDValue) {
                setORCIDValidationIssue(true);
            }

            return r;
        };

    }, [doesHaveName, doesHaveValidEmail, corresponding, setNameValidationIssue, setEmailValidationIssue, invalidORCIDValue, checksumMismatchORCIDValue]);

    useEffect(() => {

        if(!formValidator) {
            return;
        }

        const interest = formValidator.createInterest(validationCallback);
        formValidator.registerInterest(interest);

        return () => {
            formValidator.unregisterInterest(interest);
            formValidator.destroyInterest(interest);
        };

    }, [formValidator, validationCallback]);

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
        <Card className={className} reorderingGrabber={true} issue={nameValidationIssue || emailValidationIssue}>

            <AuthorSimpleFormGroup label={"Name"} value={name} onChange={handleNameChange} issue={nameValidationIssue}
                issueMessage="An author requires a name to be entered, please enter one." />
            
            <AuthorSimpleFormGroup label={"Email"} value={email} onChange={handleEmailChange} issue={emailValidationIssue}
                issueMessage="Corresponding authors require a valid email address." />

            <AuthorORCIDFormGroup label={"ORCID"} value={orcid} setValue={setOrcid} issue={orcidValidationIssue} validValue={doesHaveValidORCID} setValidationIssue={setORCIDValidationIssue}
                issueMessage={invalidORCIDValue ? "Invalid ORCID identifier supplied, all 16 digits of the identifier are required." : "Invalid ORCID identifier supplied, the identifier supplied is not a valid ORCID ID."} />

            <AuthorRelationshipFormGroup>
                <SmallBlockLabel>Roles</SmallBlockLabel>
                <div className="holder">
                    <SmallCheckboxLabel><SmallCheckBox checked={corresponding} onChange={handleCorrespondingChange} />Corresponding Author</SmallCheckboxLabel>
                    <SmallCheckboxLabel><SmallCheckBox checked={primaryPaperAuthor} onChange={handlePrimaryPaperAuthorChange} />Author on Primary Paper</SmallCheckboxLabel>
                    <SmallCheckboxLabel><SmallCheckBox checked={developedModel} onChange={handleDevelopedModelChange} />Contributed to Reproducible Model</SmallCheckboxLabel>
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
