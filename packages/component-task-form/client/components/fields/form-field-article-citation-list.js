import React, { Fragment, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { nextUniqueIdInArray, assignUniqueIdsToArrayItems } from '../../utils/helpers';
import styled from 'styled-components';

import withFormField from "./withFormField";
import { useFormValueBindingForComplexObject } from '../../hooks/useFormValueBinding';
import useFormValidation from "../../hooks/useFormValidation";

import Label, { BlockLabel } from "ds-awards-theme/components/label";
import InlineButton from "ds-awards-theme/components/inline-button";
import { DisabledStaticText } from 'ds-awards-theme/components/static-text';
import { FaPlus } from 'react-icons/fa';

import ArticleCitationEditorCard, { RemoveButtonType } from '../article-citation-editor-card';
import { th } from "ds-awards-theme";
import ValidationIssueListing from "ds-awards-theme/components/validation-issue-listing";


import { registerConditionFunction } from 'client-workflow-model/Condition';


registerConditionFunction('validCitations', citations => {
    if(!citations || !citations.length) {
        return 0;
    }
    return citations.filter(c => c.title && c.title.trim().length).length;
});



const ArticleCitationListEditorHolder = styled.div`    
    > div.inner-holder {
        border: 1px solid #d0d0d0;
        border-radius: 5px;
        padding: 5px;
    }
    
    /*min-width: 750px;*/
`;

const ArticleCitationEditorCardHolder = styled.div`

    border: 1px solid #d0d0d0;
    padding: 8px;
    border-radius: 5px;
    
    & .drag-citation {
        margin: 10px 10px 20px;
    }
    
    & .drag-citation:focus {
        border-radius: 5px;
        box-shadow: 0 0 2px 2px #2196F3;
        border-color: #2196F3;
        outline: 0;
    }
    
    & .drag-citation:focus > ${ArticleCitationEditorCard} {
        border-color: #2196F3;
    }
    
    & .button-holder {
        padding: 8px;
    }
    
        
    &.issues {
      box-shadow: inset 0 0 6px #d10f008c;
      border-color: #d10f00;
    }

`;

const DraggableArticleCitationEditorCard = ({citationId, index, ...props}) => {

    return (
        <Draggable draggableId={citationId} key={citationId} data-id={citationId} index={index}>
            {(provided, snapshot)=>
                <div className="drag-citation" ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}>
                    <ArticleCitationEditorCard {...props} />
                </div>
            }
        </Draggable>
    )
};


function FormFieldArticleCitationListEditor({ className, data, binding, description, formDefinition, formValidator, options = {} }) {

    const [citations, setCitations] = useFormValueBindingForComplexObject(data, binding, []);
    const [validationIssues, clearValidationIssues] = useFormValidation(description, formDefinition, formValidator);

    const addCitation = () => {

        const newCitation = {id:nextUniqueIdInArray(citations)};
        const newCitationList = (citations || []).splice(0);

        clearValidationIssues();
        newCitationList.push(newCitation);
        setCitations(newCitationList);
    };

    const removeCitation = c => {
        const id = c.id;
        setCitations(citations.splice(0).filter(citation => citation.id !== id));
        clearValidationIssues();
    };

    const didModifyCitation = (citation) => {
        const index = citations.findIndex(c => c.id === citation.id);
        if(index !== -1) {
            const newCitationList = citations.splice(0);
            newCitationList[index] = citation;
            setCitations(newCitationList);
            clearValidationIssues();
        }
    };

    const onDragEnd = ({destination, source}) => {

        if(!destination) {
            return;
        }

        const newCitationListing = Array.from(citations);
        const [movedCitation] = newCitationListing.splice(source.index, 1);

        newCitationListing.splice(destination.index, 0, movedCitation);
        setCitations(newCitationListing);
    };

    // Make sure all authors have a unique id associated.
    if(citations && citations.length) {
        assignUniqueIdsToArrayItems(citations);
    }

    return (
        <ArticleCitationListEditorHolder className={className} >
            {options.label ? <Label>{options.label}</Label> : null}

            <ArticleCitationEditorCardHolder className={validationIssues && validationIssues.length ? 'issues' : ''}>

                <DragDropContext onDragEnd={onDragEnd}>
                    <Droppable droppableId="citation-listing">
                        {(provided, snapshot) => (
                            <div ref={provided.innerRef}>

                                {(citations || []).map((citation, index) => {
                                    return <DraggableArticleCitationEditorCard key={citation.id} citationId={citation.id} index={index} citation={citation}
                                        didModifyCitation={didModifyCitation} removeCitation={removeCitation} removeButtonType={RemoveButtonType.CardButton}  />
                                })}

                                {provided.placeholder}
                            </div>
                        )}
                    </Droppable>
                </DragDropContext>

                <div className="button-holder">
                    <InlineButton icon={<FaPlus />} bordered={true} onClick={addCitation}>Add Article Citation</InlineButton>
                </div>

            </ArticleCitationEditorCardHolder>

            { validationIssues ? <ValidationIssueListing issues={validationIssues} /> : null }

        </ArticleCitationListEditorHolder>
    );
}


export default withFormField(FormFieldArticleCitationListEditor);

