import React from 'react';
import styled from 'styled-components';
import { FaTrashAlt } from 'react-icons/fa';
import { th } from '../src/index';


const Card = styled(({Tag = "div", className, issue, interest, simple, reorderingGrabber, children}) => {

    return (
        <Tag className={`${className || ""} ${simple ? 'simple' : ''} ${reorderingGrabber ? "reorder" : ""} ${issue ? 'issue' : ''} ${interest ? 'interest' : ''}`}>
            <div className="reorder-grabber" />
            <CardContent className="content">
                {children}
            </CardContent>
        </Tag>
    )

})`

  position: relative;
  border: ${th('card.border')};
  box-shadow: ${th('card.dropShadow')};
  padding: ${th('card.innerPadding')};
  border-radius: ${th('card.borderRadius')};
  background: ${th('card.backgroundColor')};
  
  &.reorder > .reorder-grabber {
    position: absolute;
    background: ${th('card.grabberColor')};
    width: ${th('card.grabberWidth')};
    top: 0;
    bottom: 0;
    left: 0;
  }
  
  & .content {
    width: 100%;
  }
  
  &.reorder > .content {
    margin-left: calc(${th('card.grabberWidth')} + ${th('card.grabberPadding')});
    width: calc(100% - (${th('card.grabberWidth')} + ${th('card.grabberPadding')} * 2));
  }
  
  &.issue {
    border-color: #d10f00;
    box-shadow: 0 6px 10px 1px #d10f0038;
  }
    
  &.reorder.issue > .reorder-grabber {
    background: #d10f00;
  }
  
  &.interest:not(.issue) {
    border-color: #03A9F4;
    box-shadow: 0 6px 10px 1px #03a9f430;
  }
  
  &.reorder.interest:not(.issue) > .reorder-grabber {
    background: #03A9F4;
  }
  
  &.simple {
    box-shadow: none !important;
  }
  
  &.simple.issue {
    box-shadow: none !important;
  }

`;

const CardContent = styled.div`
    position: relative;
`;

const CardRemoveButton = styled(({className, onClick}) => {

    return <div className={className || ""} onClick={onClick}><FaTrashAlt /></div>
})`
    position: absolute;
    right: -${th('card.innerPadding')};
    bottom: -${th('card.innerPadding')};
    border-top-left-radius: ${th('card.borderRadius')};
    border-top: ${th('card.border')};
    border-left: ${th('card.border')};
    padding: 4px;
    
    color: ${th('card.buttonColor')};
    font-size: 12px;

    cursor: pointer;

    .reorder & {
        right: calc(-1 * ( ${th('card.grabberPadding')} + ${th('card.innerPadding')} )); 
    }
      
    &:hover {
        color: ${th('card.hoverButtonColor')};
        background: ${th('card.borderColor')};
    }
`;



export default Card;
export { CardContent, CardRemoveButton };