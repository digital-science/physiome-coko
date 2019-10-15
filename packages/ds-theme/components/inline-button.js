import React from 'react';
import styled from 'styled-components';


const _InlineButton = ({className, tag, plain=false, children=null, bordered=false, selected=false, color="", icon, ...rest}) => {

    const combinedClassName = `${className || ""} ${children ? "" : "empty"} ${bordered ? "bordered" : "" } ${selected ? "selected" : "" } ${color}`;

    if(tag) {
        return <tag className={combinedClassName} {...rest}>{icon || null}{children}</tag>
    }
    return <button className={combinedClassName} {...rest}>{icon || null}{children}</button>
};

const InlineButton = styled(_InlineButton)`
    
    display: inline-block;
    font-size: 14px;
    line-height: 18px;
    border: none;
    background: none;
    font-family: ProximaNovaLight, sans-serif;
    cursor: pointer;
    outline: none;
    user-select: none;
    
    &:focus:not(:active) {
        box-shadow: 0 0 2px 2px #2196F3;
        border-color: #2196F3;
        outline: 0;
    }

    
    &.bordered {
        border-radius: 7px;
        padding: 4px 10px;
        border: 1px solid #d6d6d6;
    }

    &.bordered:hover {
        background: #d6d6d6;
    }
    
    &.selected {
        background: #9E9E9E;
        color: white;
    }
        
    &.selected:hover {
        background: #9E9E9E;
        color: white;
    }
    
    
    &.bordered:disabled:hover {
        cursor: default;
        background: white;
    }


    & > img {
        height: 0.65em;
        width: 0.65em;
    }
    
    & > svg {
        height: 1.3em;
        width: 1.3em;
        margin-right: 5px;
        color: dimgrey;
    }

    &.bordered > svg {
        height: 0.65em;
        width: 0.65em;
        margin-right: 5px;
        color: dimgrey;
    }
    
    &:hover > svg {
        color: black;
    }
    
    &.empty > svg {
        margin-right: 0;
    }
    
    
    &.green > svg {
        color: #4CAF50;
    }
    &.green:hover > svg {
        color: #3e7d3e;
    }

`;

export default InlineButton;


const SmallInlineButton = styled(InlineButton)`
    font-size: 12px;
    line-height: 14px;
    
    &.bordered {
        border-radius: 5px;
        padding: 2px 8px;
    }
`;

export { InlineButton, SmallInlineButton };



const PrimaryInlineButton = styled(InlineButton)`

  &.bordered { 
    font-size: 16px;
    padding: 8px 14px;
    background: #1397ff;
    color: white;
    border-color: #3ba8ff;
  }
  
  &.bordered:hover {
    background: #1377d5;
  }
  
  &.bordered > svg {
    color: white;
  }

`;

const SmallPrimaryInlineButton = styled(SmallInlineButton)`

  &.bordered { 
    font-size: 14px;
    padding: 6px 12px;
    background: #1397ff;
    color: white;
    border-color: #3ba8ff; 
  }
  
  &.bordered:hover {
    background: #1377d5;
  }
`;




export { PrimaryInlineButton, SmallPrimaryInlineButton };