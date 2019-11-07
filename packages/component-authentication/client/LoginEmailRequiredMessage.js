import React, { useState } from "react";
import styled from 'styled-components';

import { BlockLabel } from 'ds-theme/components/label';
import { TextInput } from 'ds-theme/components/text-input';
import { PrimaryInlineButton } from 'ds-theme/components/inline-button';

import { FaExclamationCircle } from 'react-icons/fa';

import withConfirmCurrentUserEmail, { EmailConfirmationOutcome } from 'component-authentication/client/withConfirmCurrentUserEmail';


const LoginEmailRequiredMessage = styled(({className, currentUser, refetchUser}) => {

    const [emailAddress, setEmailAddress] = useState("");
    const [confirmError, setConfirmError] = useState(null);
    const confirmCurrentEmail = withConfirmCurrentUserEmail();

    const onChangeEmail = (e) => {
        setEmailAddress(e.target.value);
        setConfirmError(null);
    };

    const confirmEmailAddress = (e) => {

        e.preventDefault();

        if(!emailAddress) {
            setConfirmError("Please enter an email address to be used for submission related notifications.");
            return;
        }

        confirmCurrentEmail(emailAddress).then(result => {

            if(result === EmailConfirmationOutcome.TooManyValidationAttempts) {
                setConfirmError("Too many email address validation attempts have been attempted within the last 24 hours. Please wait 24 hours before trying again.");
                return;
            }

            if(result === EmailConfirmationOutcome.InvalidEmailAddress) {
                setConfirmError("The email address entered is invalid, please enter a valid email address.");
                return;
            }

            return refetchUser();
        });
    };

    return (
        <EmailRequiredHolder className={className}>
            <ProvideEmailMessageHolder>
                <form onSubmit={confirmEmailAddress}>
                    <h3>Email Address</h3>
                    <p>A valid email address is required for us to send you manuscript submission related notifications and updates.</p>
                    <p>Please provide a valid email address below.</p>
                    <div className="email">
                        <BlockLabel>Your Email Address:</BlockLabel>
                        <TextInput value={emailAddress} onChange={onChangeEmail} />
                    </div>
                    {confirmError ? <p className="error"><FaExclamationCircle/> {confirmError}</p> : null}
                    <div className="confirm">
                        <PrimaryInlineButton submit={true} bordered={true} onClick={confirmEmailAddress}>Confirm Email Address</PrimaryInlineButton>
                    </div>
                </form>
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
  
  & > form > h3 {
    margin-top: 0;
  }
  
  & > form > p {
    margin-top: 0;
    margin-bottom: 20px;
  }
    
  & > form > p.error {
    position: relative;
    padding-left: 34px !important;

    color: #b10c00;
    font-size: 90%;
    background: #a70b0021;
    padding: 10px;
    border-radius: 8px;
    margin-top: 20px;
    margin-bottom: -10px;
    line-height: 1.2;
    
    > svg {
      position: absolute;
      top: 13px;
      left: 10px;
    }
  }

  & > form > div.email {
    margin-top: 40px;
  }
  
  & > form > div.confirm {
    margin-top: 30px;
    text-align: center;
  }
`;


export default LoginEmailRequiredMessage;