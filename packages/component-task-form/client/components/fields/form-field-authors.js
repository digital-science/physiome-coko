import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

import withFormField from "./withFormField";
import useFormValueBinding from '../../hooks/useFormValueBinding';

import Label from "ds-awards-theme/components/label";
import TextInput from "ds-awards-theme/components/text-input";
import InlineButton from "ds-awards-theme/components/inline-button";
import AffiliationAutocomplete from '../affiliation-autocomplete';

import PersonIconSrc from "ds-awards-theme/static/person.svg";
import { FaPlus, FaPenSquare, FaTrash, FaCheckSquare, FaTimesCircle } from 'react-icons/fa';


const ActionsColumn = styled.td`
    text-align: right;
    padding-right: 10px;
`;


function _AuthorRow({className, key, author, editing, editAuthor, removeAuthor, modifiedAuthor}) {

    const [name, setName] = useState(author.name || "");
    const [email, setEmail] = useState(author.email || "");
    const [affiliationValue, setAffiliationValue] = useState(author.affiliation ? (author.affiliation.name || "") : "");
    const [affiliation, setAffiliation] = useState(author.affiliation);

    const handleNameChange = (event) => {
        setName(event.target.value);
    };

    const handleEmailChange = (event) => {
        setEmail(event.target.value);
    };

    const handleAffiliationChange = (value, item) => {

        setAffiliationValue(value);

        const newAffiliation = {name: value};


        if(item) {
            newAffiliation.ror_id = item.id;

            if(item.country && item.country.country_code) {
                newAffiliation.country = item.country.country_code;
            }

            if(item.external_ids && item.external_ids.GRID && item.external_ids.GRID.preferred) {
                newAffiliation.grid_id = item.external_ids.GRID.preferred;
            }
        }

        setAffiliation(newAffiliation);
    };

    const discardChanges = () => {
        setName(author.name || "");
        setEmail(author.email || "");
        setAffiliationValue(author.affiliation ? (author.affiliation.name || "") : "");
        setAffiliation(author.affiliation);
        editAuthor(author, true);
    };

    const saveChanges = () => {
        author.name = name;
        author.email = email;
        author.affiliation = affiliation;
        modifiedAuthor(author);
        editAuthor(author, true);
    };

    return (
        <tr key={key} className={className}>
            <td>
                <img src={PersonIconSrc} alt="person" />
            </td>
            <td>
                <TextInput value={name} placeholder="Author name" onChange={handleNameChange} readOnly={!editing} />
            </td>

            <td>
                <TextInput value={email} placeholder="Email address" onChange={handleEmailChange} readOnly={!editing} />
            </td>

            <td>
                <AffiliationAutocomplete value={affiliationValue} placeholder="Affiliation" onChange={handleAffiliationChange} readOnly={!editing} currentAffiliation={affiliation} />
            </td>

            <ActionsColumn>
                {editing ? <InlineButton icon={<FaCheckSquare />} color="green" onClick={saveChanges} /> : <InlineButton icon={<FaPenSquare />} onClick={() => editAuthor(author)} />}
                {editing ? <InlineButton icon={<FaTimesCircle />} onClick={discardChanges} /> : <InlineButton icon={<FaTrash/>} onClick={() => removeAuthor(author)} />}
            </ActionsColumn>
        </tr>
    );
}

const AuthorRow = styled(_AuthorRow)`
    input {
        padding: 8px 12px;
        font-size: 15px;
    }

    input:read-only {
        border: 1px solid transparent;
        background: none;
        outline: none;
        box-shadow: none;
        cursor: default;
        
        text-overflow: ellipsis;
        white-space: nowrap;
        overflow: hidden;
    }
    
    img {
        padding-left: 5px;
        width: 18px;
    }
`;


function _AuthorsListing({className, authors, edited, editAuthor, removeAuthor, modifiedAuthor, children}) {

    return (
        <table className={className}>
            <thead className={authors && authors.length ? "" : "no-authors"}>
                <tr>
                    <th className="icon" />
                    <th className="n">Name</th>
                    <th className="n">Email</th>
                    <th className="n">Affiliation</th>
                    <th className="actions" />
                </tr>
            </thead>

            <tbody>
                <tr className="blank" />

                {authors && authors.length ? authors.map((author) => {

                    const isEdited = (edited && edited.length && edited.indexOf(author.id) !== -1);

                    return (
                        <AuthorRow key={author.id} author={author} editing={isEdited} editAuthor={editAuthor}
                            removeAuthor={removeAuthor} modifiedAuthor={modifiedAuthor} />
                    );
                }) :
                    <tr><td className="comment" colSpan={5}>Click "Add Authors" to add an author to the submission.</td></tr>
                }

                <tr className="blank" />
                <tr><td className="children" colSpan={5}>{children}</td></tr>
                <tr className="blank" />

            </tbody>
        </table>
    )
}

const AuthorsListing = styled(_AuthorsListing)`

    font-family: ProximaNovaLight,sans-serif;
    min-width: 100%;
    text-align: left;
    border-spacing: 0;
    margin-top: 4px;
    margin-bottom: 12px;
    border-radius: 5px;
    border: 1px solid #d0d0d0;

    th {
        border-bottom: 1px solid #c7c7c7;
        font-weight: normal;
        padding-top: 5px;
        padding-bottom: 5px;
    }
    
    .n {
        padding-left: 12px;
    }
    
    .icon {
        width: 1.8em;
    }
    
    .actions {
        width: 5em;
    }
    
    thead.no-authors th {
      opacity: 0.5;
    }
    
    tbody td {
        padding: 2px;
        vertical-align: middle;
    }
    
    tbody .blank {
        height: 5px;
    }
    
    .comment {
        padding: 20px;
        text-align: center;
        color: darkgrey;
    }
    
    tbody td.children {
        text-align: center;
        border-top: 1px dashed #c7c7c7;
        padding: 8px 5px 5px;
    }
`;


const AuthorsEditorHolder = styled.div`    
    > div.inner-holder {
        border: 1px solid #d0d0d0;
        border-radius: 5px;
        padding: 5px;
    }
    
    min-width: 750px;
`;



function _nextUniqueId(authors) {
    if(!authors || !authors.length) {
        return 1;
    }

    let maxAuthorId = undefined;
    authors.forEach(a => {
        if(a.id && (a.id > maxAuthorId || maxAuthorId === undefined)) {
            maxAuthorId = a.id;
        }
    });
    return maxAuthorId + 1;
}



function FormFieldAuthorsEditor({ data, binding, instanceId, instanceType, options = {} }) {

    const [authors, setAuthors] = useFormValueBinding(data, binding);
    const [edited, setEdited] = useState([]);

    // Make sure all authors have a unique id associated.
    useEffect(() => {
        if(!authors || !authors.length) {
            return;
        }

        let nextId = _nextUniqueId(authors);
        authors.forEach(a => {
            if(!a.id) {
                a.id = nextId;
                ++nextId;
            }
        });
    }, [authors]);

    const addAuthor = () => {

        const newAuthor = {id:_nextUniqueId(authors), name:"", affiliation:"", email:"", orcid:""};

        const newAuthorsList = (authors || []).splice(0);

        newAuthorsList.push(newAuthor);

        setAuthors(newAuthorsList);
        editAuthor(newAuthor);
    };

    const removeAuthor = a => {
        const id = a.id;
        if(edited && edited.length && edited.indexOf(id) !== -1) {
            setEdited(edited.splice(0).filter(e => e !== id));
        }
        setAuthors(authors.splice(0).filter(a => a.id !== id));
    };

    const editAuthor = (a, remove=false) => {

        if(remove) {
            setEdited(edited.splice(0).filter(e => e !== a.id));
        } else {
            if(edited.indexOf(a.id) === -1) {
                const newEdited = edited ? edited.splice(0) : [];
                newEdited.push(a.id);
                setEdited(newEdited);
            }
        }
    };

    const modifiedAuthor = a => {
        console.log("modifiedAuthor !!!");
        setAuthors(authors ? authors.splice(0) : []);
    };

    console.log("edited: ");
    console.dir(edited);

    return (
        <AuthorsEditorHolder>
            {options.label ? <Label>{options.label}</Label> : null}

            <AuthorsListing authors={authors} edited={edited} editAuthor={editAuthor} removeAuthor={removeAuthor} modifiedAuthor={modifiedAuthor}>
                <InlineButton icon={<FaPlus />} bordered={true} onClick={addAuthor}>Add Author</InlineButton>
            </AuthorsListing>

        </AuthorsEditorHolder>
    );
}


export default withFormField(FormFieldAuthorsEditor);