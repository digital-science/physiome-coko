import React, { useEffect } from "react";

import LoginRequiredMessage from './LoginRequiredMessage';
import LoginEmailRequiredMessage from './LoginEmailRequiredMessage';

import NonValidatedEmailMessage from "./NonValidatedEmailMessage";
import SuccessfullyValidatedEmailMessage from './SuccessfullyValidatedEmailMessage';

import useCurrentUser, { EmailValidationOutcome } from "./withCurrentUser";
import withCurrentUserModified from './withCurrentUserModified';
import AuthenticatedUserContext from "./AuthenticatedUserContext";

function _findEmailCodeInLocationHash(hash) {

    if(!hash || !hash.length) {
        return null;
    }

    const hashParts = hash.replace(/^#/g, "").split(",");
    const emailCode = hashParts.filter(part => part.match(/^email_code=[0-9]+$/i))
        .map(code => code.replace(/^email_code=/i, ""))
        .map(code => parseInt(code))
        .filter(code => code && !isNaN(code));

    return (emailCode && emailCode.length === 1) ? emailCode[0] : null;
}


export default ({message, renderApplication, renderContent, children}) => {

    // If the URL hash includes an email validation code, we want to pass that onto the "current user" request.

    const emailValidationCode = _findEmailCodeInLocationHash(window.location.hash);

    const { currentUser, emailValidationTokenOutcome, error, loading, refetch } = useCurrentUser(emailValidationCode ? `${emailValidationCode}` : null);
    withCurrentUserModified((data) => {
        refetch();
    });

    if(error || loading) {
        return null;
    }

    if(!currentUser) {
        return (
            <AuthenticatedUserContext.Provider value={currentUser}>
                {renderApplication(
                    <LoginRequiredMessage message={message} />,
                    currentUser
                )}
            </AuthenticatedUserContext.Provider>
        );
    }

    if(!currentUser.email) {
        return (
            <AuthenticatedUserContext.Provider value={currentUser}>
                {renderApplication(
                    <LoginEmailRequiredMessage currentUser={currentUser} refetchUser={refetch} />,
                    currentUser
                )}
            </AuthenticatedUserContext.Provider>
        );
    }

    const loginRelatedContent = (
        <React.Fragment>
            {emailValidationTokenOutcome === EmailValidationOutcome.Successful ? <SuccessfullyValidatedEmailMessage currentUser={currentUser} /> : null}
            {!currentUser.emailIsValidated ? <NonValidatedEmailMessage currentUser={currentUser} refetchUser={refetch} validationOutcome={emailValidationTokenOutcome} /> : null}
        </React.Fragment>
    );

    return (
        <AuthenticatedUserContext.Provider value={currentUser}>
            {renderApplication(
                renderContent ? renderContent(loginRelatedContent, currentUser) : <React.Fragment>{loginRelatedContent}{children}</React.Fragment>,
                currentUser
            )}
        </AuthenticatedUserContext.Provider>
    );
};