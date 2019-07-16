import React from "react";
import styled from 'styled-components';

import { SmallPrimaryInlineButton } from 'ds-theme/components/inline-button';
import { FaExclamationCircle } from 'react-icons/fa';


const TypeToBackground = {
    'success': '#ebffeb',
    'error': '#fff0ef',
    'warning': '#ffeacb',
    'default' : '#eff8ff'
};

const TypeToBottomBorder = {
    'success': '#e0e0e0',
    'error': '#e0e0e0',
    'warning': '#e0e0e0',
    'default' : '#e0e0e0'
};

const TypeToBoxShadowColor = {
    'success': '#0000000d',
    'error': '#ff7a7a0d',
    'warning': '#ffc10738',
    'default' : '#0000000d'
};

const TypeToTextColor = {
    'success': '#004003',
    'error': '#b10c00',
    'warning': '#5a3b00',
    'default' : '#003763'
};



const UserMessageHolder = styled(({className, type, children, ...rest}) => {

    return <div className={`${className || ""} ${type || ''}`} {...rest}>{children}</div>

})`
  font-family: QuicksandRegular,sans-serif;
  background: ${({type}) => TypeToBackground[type] || TypeToBackground.default};
  padding: 10px 15px;
  min-height: 28px;
  box-shadow: 0 2px 4px 2px ${({type}) => TypeToBoxShadowColor[type] || TypeToBoxShadowColor.default};
  border-top: 1px solid #ebebeb;
  border-bottom: 1px solid ${({type}) => TypeToBottomBorder[type] || TypeToBottomBorder.default};
  font-size: 16px;
  color: ${({type}) => TypeToTextColor[type] || TypeToTextColor.default};
  position: relative;
  
  display: flex;
  flex-wrap: nowrap;
  justify-content: space-between;
  align-items: center;
  
  &.warning ${SmallPrimaryInlineButton} {
    background: #ff9800;
    border-color: #ef8e00;
  }
  &.warning ${SmallPrimaryInlineButton}:hover {
    background: #c77700;
  }

`;

export default UserMessageHolder;

const Message = styled.div`
`;

const ErrorMessage = styled(({className, children}) => {

    return <div className={className}><FaExclamationCircle />{children}</div>

})`
    color: #b10c00;
    & > svg {
      margin-right: 0.5em;
      margin-right: 1ch;
      padding-top: 0.075em;
    }
`;

export { Message, ErrorMessage };