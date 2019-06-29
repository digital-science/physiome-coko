import React, { useState } from "react";
import styled from 'styled-components';

import { SmallInlineButton } from 'ds-awards-theme/components/inline-button';
import { SmallTextInput } from 'ds-awards-theme/components/text-input';


const _NonValidatedEmailAddressMessage = ({className}) => {

    return (
        <div className={className}>
            <div>Your email address has not been validated yet. Please check your emails for a validation code/link.</div>
            <div>
                <div className="validation">
                    <SmallTextInput></SmallTextInput>
                    <SmallInlineButton bordered={true}>Validate</SmallInlineButton>
                </div>

                <SmallInlineButton bordered={true}>Resend Code</SmallInlineButton>
            </div>
        </div>
    );
};

const NonValidatedEmailAddressMessage = styled(_NonValidatedEmailAddressMessage)`
  font-family: QuicksandRegular,sans-serif;
  background: white;
  padding: 10px 15px;
  box-shadow: 0 4px 4px 4px #0000000d;
  border-top: 1px solid #ebebeb;
  font-size: 16px;
    
  display: flex;
  flex-wrap: nowrap;
  justify-content: space-between;
  align-items: center;
  
  & > div {
    display: flex;
  }
  
  & > div + div {
    margin-left: 15px;
  }
    
  & ${SmallInlineButton} {
    font-size: 14px;
    padding: 6px 12px;
    background: #1397ff;
    color: white;
    border-color: #3ba8ff;
  }
  
  & ${SmallInlineButton}:hover {
    background: #1377d5;
  }
  
  & > div > div.validation {
    margin-right: 15px;
    display: flex;
    align-items: center;
        
    > ${SmallTextInput} {
      margin-right: 5px;
      width: 10em;
    }
  }
`;

export default NonValidatedEmailAddressMessage;