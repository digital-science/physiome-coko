import React, { useState } from "react";
import styled from 'styled-components';

import { BasicOverlay } from 'component-overlay';
import { FaExclamationCircle } from 'react-icons/fa';
import { BlockLabel } from "ds-awards-theme/components/label";
import { TextInput } from "ds-awards-theme/components/text-input";
import { InlineButton } from "ds-awards-theme/components/inline-button";
import { th } from 'ds-awards-theme';

import withConfirmCurrentUserEmail, {EmailConfirmationOutcome} from './withConfirmCurrentUserEmail';


const ConfirmationContent = styled.div`
  min-width: 400px;
  max-width: 550px;
  
  & div.email {
    margin-top: 20px;
  }

  & p.error {
    position: relative;
    padding-left: 34px !important;

    font-family: ${th('modal.fontFamily')};
    color: #b10c00;
    font-size: 90%;
    background: #a70b0021;
    padding: 10px;
    border-radius: 8px;
    margin-top: 20px;
    margin-bottom: 20px;
    line-height: 1.2;
    
    > svg {
      position: absolute;
      top: 13px;
      left: 10px;
    }
  }
`;

const ConfirmationHeading = styled.div`
  margin-bottom: 15px;
  font-family: ${th('modal.fontFamily')};
  font-size: ${th('modal.headingFontSize')};
  font-weight: ${th('modal.headingFontWeight')};
  color: ${th('modal.headingTextColor')};
`;

const ConfirmationMessage = styled.div`
  margin-top: 15px;
  margin-bottom: 15px;
  font-family: ${th('modal.fontFamily')};
  font-size: ${th('modal.messageFontSize')};
  color: ${th('modal.messageTextColor')};
`;


const ConfirmationButtonSet = styled.div`
  text-align: right;
  margin-top: 15px;
  
  > ${InlineButton} + ${InlineButton} {
    margin-left: 10px;
  }
`;



const _ChangeEmailAddressOverlay = ({className, currentUser, isOpen, closeOverlay, changedEmailAddress}) => {

    const [confirmError, setConfirmError] = useState(null);
    const [emailAddress, setEmailAddress] = useState(currentUser.email || "");
    const confirmCurrentEmail = withConfirmCurrentUserEmail();

    const onChangeEmail = (e) => {
        setEmailAddress(e.target.value);
        setConfirmError(null);
    };

    const changeEmailAddress = () => {

        if(!emailAddress) {
            setConfirmError("Please enter an email address to be used for submission related notifications.");
            return;
        }

        confirmCurrentEmail(emailAddress).then(result => {

            if(result === EmailConfirmationOutcome.TooManyValidationAttempts) {
                setConfirmError("Too many email address changes or verification re-send attempts have been attempted within the last 24 hours. Please wait 24 hours before trying again.");
                return;
            }

            if(result === EmailConfirmationOutcome.InvalidEmailAddress) {
                setConfirmError("The email address entered is invalid, please enter a valid email address.");
                return;
            }

            if(changedEmailAddress) {
                changedEmailAddress(emailAddress);
            }

        }).catch(err => {

            setConfirmError("A problem occurred while trying change your email address. Please try again or report this issue to the journal team.");

        });
    };

    return (
        <div className={className}>
            <BasicOverlay isOpen={isOpen} onRequestClose={closeOverlay}>
                <ConfirmationContent>
                    <ConfirmationHeading>Change Email Address</ConfirmationHeading>
                    <ConfirmationMessage>
                        Please enter your new email address below. A verification link will be sent to your new email address.
                        New submissions cannot be submitted until your email address is verified.
                    </ConfirmationMessage>

                    <div className="email">
                        <BlockLabel>New Email Address:</BlockLabel>
                        <TextInput value={emailAddress} onChange={onChangeEmail} />
                    </div>

                    {confirmError ? <p className="error"><FaExclamationCircle/> {confirmError}</p> : null}

                    <ConfirmationButtonSet>
                        <InlineButton bordered={true} onClick={closeOverlay}>Cancel</InlineButton>
                        <InlineButton bordered={true} default={true} onClick={changeEmailAddress}>Change Email Address</InlineButton>
                    </ConfirmationButtonSet>
                </ConfirmationContent>
            </BasicOverlay>
        </div>
    );
};

const ChangeEmailAddressOverlay = styled(_ChangeEmailAddressOverlay)`


`;

export default ChangeEmailAddressOverlay;