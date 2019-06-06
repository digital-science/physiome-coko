import React from 'react';
import styled from 'styled-components';


const _InlineButton = ({className, tag, plain=false, children=null, bordered=false, color="", icon, ...rest}) => {

    const combinedClassName = `${className || ""} ${children ? "" : "empty"} ${bordered ? "bordered" : "" } ${color}`;

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
    
    &.bordered {
        border-radius: 7px;
        padding: 2px 10px;
        background: #d6d6d6;
    }

    &.bordered:hover {
        background: #b4b4b4;
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