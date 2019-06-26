import React from 'react';
import styled from 'styled-components';
import { FaTrashAlt } from 'react-icons/fa';
import { th } from '../src/index';


const Card = styled(({Tag = "div", className, reorderingGrabber, children}) => {

    return (
        <Tag className={`${className || ""} ${reorderingGrabber ? "reorder" : ""}`}>
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
  
`;

const CardContent = styled.div`
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