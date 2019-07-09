import React, { useState, useEffect } from "react";
import UserMessageHolder, { Message } from './UserMessageHolder';

const SuccessfullyValidatedEmailMessage = ({className, currentUser}) => {

    const [display, setDisplay] = useState(true);

    useEffect(() => {
        const t = setTimeout(() => {
            setDisplay(false);
        }, 5000);
        return () => clearTimeout(t);
    }, [currentUser]);

    return display ? (
        <UserMessageHolder className={className} type={'success'}>
            <Message>Successfully validated email address ({currentUser.email}). You can now receive system notifications and submit manuscripts.</Message>
        </UserMessageHolder>
    ) : null;
};

export default SuccessfullyValidatedEmailMessage;