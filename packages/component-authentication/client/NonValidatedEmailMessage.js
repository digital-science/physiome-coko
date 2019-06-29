import React, { useState } from "react";
import styled from 'styled-components';

import UserMessageHolder from './UserMessageHolder';

import { SmallPrimaryInlineButton } from 'ds-awards-theme/components/inline-button';
import { SmallTextInput } from 'ds-awards-theme/components/text-input';


const _NonValidatedEmailAddressMessage = ({className}) => {

    return (
        <UserMessageHolder className={className}>
            <div>Your email address has not been validated yet. Please check your email for a validation link.</div>
            <div>
                {/*<div className="validation">
                    <SmallTextInput></SmallTextInput>
                    <SmallPrimaryInlineButton bordered={true}>Validate</SmallPrimaryInlineButton>
                </div>*/}

                <SmallPrimaryInlineButton bordered={true}>Resend Code</SmallPrimaryInlineButton>
            </div>
        </UserMessageHolder>
    );
};

const NonValidatedEmailAddressMessage = styled(_NonValidatedEmailAddressMessage)`    
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