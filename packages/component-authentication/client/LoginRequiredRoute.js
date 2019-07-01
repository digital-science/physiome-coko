import LoginRequiredMessage from './LoginRequiredMessage';
import LoginEmailRequiredMessage from './LoginEmailRequiredMessage';

import NonValidatedEmailMessage from "./NonValidatedEmailMessage";
import SuccessfullyValidatedEmailMessage from './SuccessfullyValidatedEmailMessage';

import useCurrentUser, { EmailValidationOutcome } from "./withCurrentUser";
import AuthenticatedUserContext from "./AuthenticatedUserContext";
import React from "react";

export default ({message, renderApplication, renderContent, children}) => {

    // If the URL hash includes an email validation code, we want to pass that onto the "current user" request.

    const hash = window.location.hash;
    let emailValidationCode = null;

    if(hash) {

        const hashParts = hash.replace(/^#/g, "").split(",");
        const emailCode = hashParts.filter(part => part.match(/^email_code=[0-9]+$/i))
            .map(code => code.replace(/^email_code=/i, ""))
            .map(code => parseInt(code))
            .filter(code => code && !isNaN(code));

        if(emailCode && emailCode.length === 1) {
            emailValidationCode = emailCode[0];
        }
    }

    const { currentUser, emailValidationTokenOutcome, error, loading, refetch } = useCurrentUser(emailValidationCode ? `${emailValidationCode}` : null);
    if(error || loading) {
        return null;
    }

    if(!currentUser) {
        return (
            <AuthenticatedUserContext.Provider value={currentUser}>
                {renderApplication(
                    <LoginRequiredMessage message={message} />
                )}
            </AuthenticatedUserContext.Provider>
        );
    }

    if(!currentUser.email) {
        return (
            <AuthenticatedUserContext.Provider value={currentUser}>
                {renderApplication(
                    <LoginEmailRequiredMessage currentUser={currentUser} refetchUser={refetch} />
                )}
            </AuthenticatedUserContext.Provider>
        );
    }

    if(emailValidationTokenOutcome !== null) {
        console.dir(emailValidationTokenOutcome);
    }

    const loginRelatedContent = (
        <React.Fragment>
            {emailValidationTokenOutcome === EmailValidationOutcome.Successful ? <SuccessfullyValidatedEmailMessage currentUser={currentUser} /> : null}
            {!currentUser.emailIsValidated ? <NonValidatedEmailMessage currentUser={currentUser} refetchUser={refetch} validationOutcome={emailValidationTokenOutcome} /> : null}
        </React.Fragment>
    );

    return (
        <AuthenticatedUserContext.Provider value={currentUser}>
            {renderApplication(renderContent ? renderContent(loginRelatedContent) : <React.Fragment>{loginRelatedContent}{children}</React.Fragment>)}
        </AuthenticatedUserContext.Provider>
    );
};