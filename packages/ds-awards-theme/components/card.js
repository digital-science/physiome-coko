import React from 'react';
import styled from 'styled-components';


const Card = styled(({Tag = "div", className, reorderingGrabber, children}) => {

    return (
        <Tag className={`${className || ""} ${reorderingGrabber ? "reorder" : ""}`}>
            <div className="reorder-grabber" />
            <div className="content">
                {children}
            </div>
        </Tag>
    )

})`

  position: relative;
  border: 1px solid #d0d0d0;
  box-shadow: 0 1px 10px 1px #d0d0d0d4;
  padding: 10px;
  border-radius: 5px;
  background: white;
  
  &.reorder > .reorder-grabber {
    position: absolute;
    left: 0;
    width: 5px;
    top: 0;
    bottom: 0;
    background: #d0d0d0;
  }
  
  & .content {
    width: calc(100% - 10px);
  }
  
  &.reorder > .content {
    margin-left: 10px;
    width: calc(100% - 20px);
  }
  
`;


export default Card;

