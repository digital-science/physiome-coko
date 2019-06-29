import React, { useState } from "react";
import styled from 'styled-components';

import { BlockLabel } from 'ds-awards-theme/components/label';
import { TextInput } from 'ds-awards-theme/components/text-input';
import { PrimaryInlineButton } from 'ds-awards-theme/components/inline-button';

import withConfirmCurrentUserEmail from 'component-authentication/client/withConfirmCurrentUserEmail';


const LoginEmailRequiredMessage = styled(({className, currentUser, refetchUser}) => {

    const [emailAddress, setEmailAddress] = useState();
    const confirmCurrentEmail = withConfirmCurrentUserEmail();

    const onChangeEmail = (e) => {
        setEmailAddress(e.target.value);
    };

    const confirmEmailAddress = () => {

        if(!emailAddress) {
            return;
        }

        confirmCurrentEmail(emailAddress).then(result => {
            return refetchUser();
        });
    };

    return (
        <EmailRequiredHolder className={className}>
            <ProvideEmailMessageHolder>
                <h3>Email Address</h3>
                <p>A valid email address is required for us to send you manuscript submission related notifications and updates.</p>
                <p>Please provide a valid email address below.</p>
                <div className="email">
                    <BlockLabel>Your Email Address:</BlockLabel>
                    <TextInput value={emailAddress} onChange={onChangeEmail} />
                </div>
                <div className="confirm">
                    <PrimaryInlineButton bordered={true} onClick={confirmEmailAddress}>Confirm Email Address</PrimaryInlineButton>
                </div>
            </ProvideEmailMessageHolder>
        </EmailRequiredHolder>
    );
})`
  
  
`;

const EmailRequiredHolder = styled.div`
    text-align: center;
    padding: 20px;
`;

const ProvideEmailMessageHolder = styled.div`

  font-family: QuicksandRegular, sans-serif;

  width: 350px;
  margin: auto auto;
  background: white;
  padding: 40px;
  box-shadow: 3px 3px 8px 2px #00000026;
  
  text-align: initial;
  
  & > h3 {
    margin-top: 0;
  }
  
  & > p {
    margin-top: 0;
    margin-bottom: 20px;
  }
  
  & > div.email {
    margin-top: 40px;
  }
  
  & > div.confirm {
    margin-top: 30px;
    text-align: center;
  }
`;


export default LoginEmailRequiredMessage;