import React, { useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { nextUniqueIdInArray, assignUniqueIdsToArrayItems } from '../../utils/helpers';
import styled from 'styled-components';

import withFormField from "./withFormField";
import { useFormValueBindingForComplexObject } from '../../hooks/useFormValueBinding';

import Label from "ds-awards-theme/components/label";
import InlineButton from "ds-awards-theme/components/inline-button";
import { FaPlus } from 'react-icons/fa';

import FunderEditorCard from '../funder-editor-card';


const FundingEditorHolder = styled.div`    
    > div.inner-holder {
        border: 1px solid #d0d0d0;
        border-radius: 5px;
        padding: 5px;
    }
    
    min-width: 750px;
`;

const FundingEditorCardHolder = styled.div`

    border: 1px solid #d0d0d0;
    padding: 8px;
    border-radius: 5px;
    
    & .drag-funder {
        margin: 10px 10px 20px;
    }
    
    & .button-holder {
        padding: 8px;
    }
`;

const DraggableFunderCard = ({funderId, index, ...props}) => {

    return (
        <Draggable draggableId={funderId} key={funderId} data-id={funderId} index={index}>
            {(provided, snapshot)=>
                <div className="drag-funder" ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}>
                    <FunderEditorCard {...props} />
                </div>
            }
        </Draggable>
    )
};


function FormFieldFundingEditor({ className, data, binding, instanceId, instanceType, options = {} }) {

    const [funding, setFunding] = useFormValueBindingForComplexObject(data, binding, [{id:1}]);

    // Make sure all authors have a unique id associated.
    useEffect(() => {
        if(!funding || !funding.length) {
            return;
        }
        assignUniqueIdsToArrayItems(funding);

    }, [funding]);

    const addFunding = () => {

        const newFunding = {id:nextUniqueIdInArray(funding), grants:[{id:1}]};
        const newFundingList = (funding || []).splice(0);

        newFundingList.push(newFunding);
        setFunding(newFundingList);
    };

    const removeFunding = f => {
        const id = f.id;
        setFunding(funding.splice(0).filter(funder => funder.id !== id));
    };

    const didModifyFunder = (funder) => {
        setFunding(funding);
    };

    const onDragEnd = ({destination, source}) => {

        if(!destination) {
            return;
        }

        const newFundingListing = Array.from(funding);
        const [movedFunder] = newFundingListing.splice(source.index, 1);

        newFundingListing.splice(destination.index, 0, movedFunder);
        setFunding(newFundingListing);
    };


    return (
        <FundingEditorHolder className={className}>
            {options.label ? <Label>{options.label}</Label> : null}

            <FundingEditorCardHolder>

                <DragDropContext onDragEnd={onDragEnd}>
                    <Droppable droppableId="funding-listing">
                        {(provided, snapshot) => (
                            <div ref={provided.innerRef}>

                                {(funding || []).map((funder, index) => {
                                    return <DraggableFunderCard key={funder.id} funderId={funder.id} index={index} funder={funder}
                                        didModifyFunder={didModifyFunder} removeFunder={removeFunding} />
                                })}

                                {provided.placeholder}
                            </div>
                        )}
                    </Droppable>
                </DragDropContext>

                <div className="button-holder">
                    <InlineButton icon={<FaPlus />} bordered={true} onClick={addFunding}>Add Funding Acknowledgement</InlineButton>
                </div>

            </FundingEditorCardHolder>

        </FundingEditorHolder>
    );
}


export default withFormField(FormFieldFundingEditor);