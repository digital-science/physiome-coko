import React, { useState, useEffect } from "react";
import styled from 'styled-components';

import withResendCurrentUserEmailValidation, { EmailConfirmationOutcome } from './withResendCurrentUserEmailValidation';
import { EmailValidationOutcome } from './withCurrentUser';

import UserMessageHolder, { Message, ErrorMessage } from './UserMessageHolder';
import ChangeEmailAddressOverlay from './ChangeEmailAddressOverlay';

import { SmallPrimaryInlineButton } from 'ds-awards-theme/components/inline-button';


function messageForUserAndOutcome(currentUser, validationOutcome) {

    const emailAddress = currentUser && currentUser.email ? ` (${currentUser.email})` : ``;

    if(validationOutcome === EmailValidationOutcome.ExpiredToken ) {

        return `The email verification link you have attempted to use has expired. Please click 'Resend Code' to generate and send a new verification link to your email address${emailAddress}.`;

    } else if(validationOutcome === EmailValidationOutcome.InvalidToken ) {

        return `The email verification link you have attempted to use is invalid. Please click 'Resend Code' to generate and send a new verification link to your email address${emailAddress}.`;
    }

    return `Your email address${emailAddress} has not been verified yet. Please check your email for a verification link.`
}


function messageTypeForOutcome(validationOutcome) {

    return (validationOutcome === EmailValidationOutcome.ExpiredToken || validationOutcome === EmailValidationOutcome.InvalidToken) ? 'warning' : null;
}


const _NonValidatedEmailAddressMessage = ({className, currentUser, refetchUser, validationOutcome}) => {

    const [currentMessage, setCurrentMessage] = useState(messageForUserAndOutcome(currentUser, validationOutcome));
    const [hideButtons, setHideButtons] = useState(false);
    const [messageType, setMessageType] = useState(messageTypeForOutcome(currentUser));

    const [showChangeEmail, setShowChangeEmail] = useState(false);
    const resendUserEmailValidation = withResendCurrentUserEmailValidation();

    useEffect(() => {

        setCurrentMessage(messageForUserAndOutcome(currentUser, validationOutcome));
        setMessageType(messageTypeForOutcome(validationOutcome));
        setHideButtons(false);

    }, [currentUser, validationOutcome]);

    const didChangeEmailAddress = () => {

        if(refetchUser) {
            refetchUser().then(_ => {
                setShowChangeEmail(false);
            });
        } else {
            setShowChangeEmail(false);
        }
    };

    const performResendValidation = () => {

        resendUserEmailValidation().then(result => {

            if(result === EmailConfirmationOutcome.TooManyValidationAttempts) {
                setCurrentMessage("Too many email address changes or verification re-send requests have been attempted within the last 24 hours. Please wait 24 hours before trying again.");
                setMessageType('error');
                return;
            }

            setCurrentMessage(`A verification link was resent to your email address ${currentUser && currentUser.email ? `(${currentUser.email})` : ``}. Please check your emails for the verification link.`);
            setHideButtons(true);

        }).catch(err => {

            setCurrentMessage(`An error was encountered while attempting to re-send your verification email. Please try again later or contact support.`);
            setMessageType('error');
        });
    };

    return (
        <UserMessageHolder className={className} type={messageType}>
            {messageType === 'error' ? <ErrorMessage>{currentMessage}</ErrorMessage> : <Message>{currentMessage}</Message> }
            <div className="buttons">
                {!hideButtons && messageType !== 'error' ? (
                    <React.Fragment>
                        <SmallPrimaryInlineButton bordered={true} onClick={() => setShowChangeEmail(true)}>Change Email</SmallPrimaryInlineButton>
                        <SmallPrimaryInlineButton bordered={true} onClick={performResendValidation}>Resend Code</SmallPrimaryInlineButton>
                    </React.Fragment>
                ) : null}
            </div>

            <ChangeEmailAddressOverlay currentUser={currentUser} isOpen={showChangeEmail}
                closeOverlay={() => setShowChangeEmail(false)} changedEmailAddress={didChangeEmailAddress} />

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
  
  & > div.buttons {
    flex-grow: 1;
    flex-shrink: 0;
    justify-content: flex-end;
  }
  
  & > div + div {
    margin-left: 15px;
  }
  
  & ${SmallPrimaryInlineButton} + ${SmallPrimaryInlineButton} {
    margin-left: 10px;
  }
`;

export default NonValidatedEmailAddressMessage;
