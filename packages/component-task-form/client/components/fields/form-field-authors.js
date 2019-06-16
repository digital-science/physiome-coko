import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import styled from 'styled-components';

import withFormField from "./withFormField";
import { useFormValueBindingForComplexObject } from '../../hooks/useFormValueBinding';

import Label from "ds-awards-theme/components/label";
import InlineButton, {SmallInlineButton} from "ds-awards-theme/components/inline-button";

import { FaPlus, FaPenSquare, FaTrash, FaCheckSquare, FaTimesCircle } from 'react-icons/fa';


import AuthorEditorCard from "../author-editor-card";


const AuthorsEditorHolder = styled.div`    
    > div.inner-holder {
        border: 1px solid #d0d0d0;
        border-radius: 5px;
        padding: 5px;
    }
    
    min-width: 750px;
`;

const AuthorEditorCardHolder = styled.div`

    border: 1px solid #d0d0d0;
    padding: 8px;
    border-radius: 5px;
    
    & .drag-author {
        margin: 10px 10px 20px;
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


function FormFieldAuthorsEditor({ className, data, binding, instanceId, instanceType, options = {} }) {

    const [authors, setAuthors] = useFormValueBindingForComplexObject(data, binding);

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

        const newAuthor = {id:_nextUniqueId(authors)};
        const newAuthorsList = (authors || []).splice(0);

        newAuthorsList.push(newAuthor);
        setAuthors(newAuthorsList);
    };

    const removeAuthor = a => {
        const id = a.id;
        setAuthors(authors.splice(0).filter(a => a.id !== id));
    };

    const didModifyAuthor = (author) => {
        console.log("Did modify author");
        console.dir(author);

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
        <AuthorsEditorHolder className={className}>
            {options.label ? <Label>{options.label}</Label> : null}

            <AuthorEditorCardHolder>

                <DragDropContext onDragEnd={onDragEnd}>
                    <Droppable droppableId="author-listing">
                        {(provided, snapshot) => (
                            <div ref={provided.innerRef}>

                                {(authors || []).map((author, index) => {
                                    return <DraggableAuthorCard key={author.id} authorId={author.id} index={index} author={author} didModifyAuthor={didModifyAuthor} removeAuthor={removeAuthor} />
                                })}

                                {provided.placeholder}
                            </div>
                        )}
                    </Droppable>
                </DragDropContext>

                <div style={{"padding": "8px"}}>
                    <InlineButton icon={<FaPlus />} bordered={true} onClick={addAuthor}>Add Additional Author</InlineButton>
                </div>

            </AuthorEditorCardHolder>

        </AuthorsEditorHolder>
    );
}


export default withFormField(FormFieldAuthorsEditor);