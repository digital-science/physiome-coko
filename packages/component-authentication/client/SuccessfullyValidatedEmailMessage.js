import React from "react";
import UserMessageHolder, { Message } from './UserMessageHolder';

const SuccessfullyValidatedEmailMessage = ({className, currentUser}) => {

    return (
        <UserMessageHolder className={className} type={'success'}>
            <Message>Successfully validated email address ({currentUser.email}). You can now receive system notifications and submit manuscripts.</Message>
        </UserMessageHolder>
    );
};

export default SuccessfullyValidatedEmailMessage;