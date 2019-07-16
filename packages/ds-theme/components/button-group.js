import React from 'react';
import styled from 'styled-components';

import InlineButton from './inline-button';


const _ButtonGroup = ({className, children}) => {
    return (
        <div className={className}>
            {children}
        </div>
    );
};

const ButtonGroup = styled(_ButtonGroup)`

  text-align: center; 
  
  & ${InlineButton} + ${InlineButton} {
    border-left: none;
    border-top-left-radius: 0;
    border-bottom-left-radius: 0;
  }
  
  & ${InlineButton}:not(:last-child) {
    border-top-right-radius: 0;
    border-bottom-right-radius: 0;
  }
`;

export default ButtonGroup;