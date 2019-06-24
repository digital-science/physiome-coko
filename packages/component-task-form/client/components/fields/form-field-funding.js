import React, { Fragment, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { nextUniqueIdInArray, assignUniqueIdsToArrayItems } from '../../utils/helpers';
import styled from 'styled-components';

import withFormField from "./withFormField";
import { useFormValueBindingForComplexObject } from '../../hooks/useFormValueBinding';

import Label, { BlockLabel } from "ds-awards-theme/components/label";
import InlineButton from "ds-awards-theme/components/inline-button";
import { DisabledStaticText } from 'ds-awards-theme/components/static-text';
import { FaPlus } from 'react-icons/fa';

import FunderEditorCard from '../funder-editor-card';
import { th } from "ds-awards-theme";


const FundingEditorHolder = styled.div`    
    > div.inner-holder {
        border: 1px solid #d0d0d0;
        border-radius: 5px;
        padding: 5px;
    }
    
    /*min-width: 750px;*/
`;

const FundingEditorCardHolder = styled.div`

    border: 1px solid #d0d0d0;
    padding: 8px;
    border-radius: 5px;
    
    & .drag-funder {
        margin: 10px 10px 20px;
    }
    
    & .drag-funder:focus {
        border-radius: 5px;
        box-shadow: 0 0 2px 2px #2196F3;
        border-color: #2196F3;
        outline: 0;
    }
    
    & .drag-funder:focus > ${FunderEditorCard} {
        border-color: #2196F3;
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


// ----
// Authors (static list)
// ---

const FunderRow = styled.li`
  > ol {
    margin: 0;
    padding: 0;
  }
  > ol li {
    display: inline;
  }
  > ol li:before {
    content: ', ';
  }
  > ol li:first-child:before {
    content: '';
  } 
`;

const FundingListing = styled( ({className, funding}) => {
    return (
        <ol className={className}>
            {funding.map((funder, index) => {

                const grants = funder.grants ? funder.grants.filter(g => g.projectNumber) : null;

                return (
                    <FunderRow key={index}>
                        {funder.organization ?
                            <React.Fragment>
                                {funder.organization.name}
                                {funder.organization.country && funder.organization.country.country_code ? <span> ({funder.organization.country.country_code})</span> : null}
                            </React.Fragment>
                            :
                            <React.Fragment>No funder specified</React.Fragment>
                        }
                        { grants ?
                            <ol>
                                {grants.map((g, i) => <li key={i}>{g.projectNumber}</li>)}
                            </ol>
                            : null
                        }
                    </FunderRow>
                );

            } )}
        </ol>
    );
})`
 
    list-style: none;
    margin: 0;
    padding: 0;
    font-family: ${th('authorListing.fontFamily')};
    font-size: ${th('authorListing.fontSize')};
    
    counter-reset: funding-counter;
    padding-left: 20px;

    & > li {
      margin: 0;
      counter-increment: funding-counter;
      position: relative;
    }
    & > li::before {
      content: counter(funding-counter) ".";
      font-size: ${th('authorListing.fontSize')};
      position: absolute;
      left: -20px;
      line-height: 1.2em;
      width: 20px;
      height: 1.2em;
      top: 0;
      text-align: left;
    }
    
    & > li + li {
      margin-top: 5px;
    }
`;

function _FormFieldFundingListing({ className, data, binding, instanceId, instanceType, options = {} }) {

    const [funding] = useFormValueBindingForComplexObject(data, binding);
    return (
        <div className={className}>
            {options.label ? <BlockLabel>{options.label}</BlockLabel> : null}
            {(funding && funding instanceof Array && funding.length) ?
                <FundingListing funding={funding} /> : <DisabledStaticText>No Funding Acknowledgements were specified</DisabledStaticText>
            }
        </div>
    );
}

const FormFieldFundingListing = withFormField(_FormFieldFundingListing);



export { FormFieldFundingListing };