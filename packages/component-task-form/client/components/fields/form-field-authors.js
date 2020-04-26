import React, { useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { nextUniqueIdInArray, assignUniqueIdsToArrayItems } from '../../utils/helpers';
import styled from 'styled-components';

import withFormField from "./withFormField";
import { useFormValueBindingForComplexObject } from '../../hooks/useFormValueBinding';

import Label from "ds-theme/components/label";
import InlineButton from "ds-theme/components/inline-button";
import { NoteStaticText } from 'ds-theme/components/static-text';
import ValidationIssueListing from 'ds-theme/components/validation-issue-listing';
import { FaPlus } from 'react-icons/fa';


import AuthorEditorCard from "../author-editor-card";
import useFormValidation, {formFieldClassNameWithValidations} from "../../hooks/useFormValidation";



const AuthorsEditorHolder = styled.div`    
    > div.inner-holder {
        border: 1px solid #d0d0d0;
        border-radius: 5px;
        padding: 5px;
    }
    
    /*min-width: 750px;*/
`;

const AuthorEditorCardHolder = styled.div`

    border: 1px solid #d0d0d0;
    padding: 8px;
    border-radius: 5px;
    
    & .drag-author {
        margin: 10px 10px 20px;
    }
    
    & .drag-author:focus {
        border-radius: 5px;
        box-shadow: 0 0 2px 2px #2196F3;
        border-color: #2196F3;
        outline: 0;
    }
    
    & .drag-author:focus > ${AuthorEditorCard} {
        border-color: #2196F3;
    }
    
    &.issues {
      box-shadow: inset 0 0 6px #d10f008c;
      border-color: #d10f00;
    }
        
    & > ${NoteStaticText} {
      padding: 8px;
      display: block;
    }
`;

const DraggableAuthorCard = ({authorId, index, ...props}) => {

    return (
        <Draggable draggableId={authorId} key={authorId} data-id={authorId} index={index}>
            {(provided, snapshot)=>
                <div className="drag-author" ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}>
                    <AuthorEditorCard {...props} />
                </div>
            }
        </Draggable>
    )
};


function FormFieldAuthorsEditor({ className, data, binding, description, formDefinition, formValidator, options = {} }) {

    const [authors, setAuthors] = useFormValueBindingForComplexObject(data, binding);
    const [validationIssues, clearValidationIssues] = useFormValidation(description, formDefinition, formValidator);
    const { note = null } = options;


    // Make sure all authors have a unique id associated.
    useEffect(() => {
        if(!authors || !authors.length) {
            return;
        }
        assignUniqueIdsToArrayItems(authors);
    }, [authors]);

    const addAuthor = () => {

        const newAuthor = {id:nextUniqueIdInArray(authors)};
        const newAuthorsList = (authors || []).splice(0);

        clearValidationIssues();
        newAuthorsList.push(newAuthor);
        setAuthors(newAuthorsList);
    };

    const removeAuthor = a => {
        clearValidationIssues();

        const id = a.id;
        setAuthors(authors.splice(0).filter(a => a.id !== id));
    };

    const didModifyAuthor = (author) => {
        // Any modification to a user needs to reset any "cached" figshare user ID.
        if(author) {
            delete author.figshareUserId;
        }
        clearValidationIssues();
        setAuthors(authors);
    };

    const onDragEnd = ({destination, source}) => {

        if(!destination) {
            return;
        }

        const newAuthorListing = Array.from(authors);
        const [movedAuthor] = newAuthorListing.splice(source.index, 1);

        newAuthorListing.splice(destination.index, 0, movedAuthor);
        setAuthors(newAuthorListing);
    };


    return (
        <AuthorsEditorHolder className={formFieldClassNameWithValidations(className, validationIssues)}>
            {options.label ? <Label>{options.label}</Label> : null}

            <AuthorEditorCardHolder className={validationIssues && validationIssues.length ? 'issues' : ''}>

                <DragDropContext onDragEnd={onDragEnd}>
                    <Droppable droppableId="author-listing">
                        {(provided, snapshot) => (
                            <div ref={provided.innerRef}>

                                {(authors || []).map((author, index) => {
                                    return (
                                        <DraggableAuthorCard key={author.id} authorId={author.id} index={index} author={author}
                                            formValidator={formValidator} didModifyAuthor={didModifyAuthor} removeAuthor={removeAuthor} />
                                    );
                                })}

                                {provided.placeholder}
                            </div>
                        )}
                    </Droppable>
                </DragDropContext>

                {note && (!authors || !authors.length) ? <NoteStaticText>{note}</NoteStaticText> : null }

                <div style={{"padding": "8px"}}>
                    <InlineButton icon={<FaPlus />} bordered={true} onClick={addAuthor}>Add Author</InlineButton>
                </div>

            </AuthorEditorCardHolder>

            { validationIssues ? <ValidationIssueListing issues={validationIssues} /> : null }

        </AuthorsEditorHolder>
    );
}


export default withFormField(FormFieldAuthorsEditor);