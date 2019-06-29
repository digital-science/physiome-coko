import LoginRequiredMessage from './LoginRequiredMessage';
import LoginEmailRequiredMessage from './LoginEmailRequiredMessage';

import NonValidatedEmailMessage from "./NonValidatedEmailMessage";

import useCurrentUser from "./withCurrentUser";
import AuthenticatedUserContext from "./AuthenticatedUserContext";
import React from "react";

export default ({message, renderApplication, children}) => {

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

        console.log(typeof emailCode);
        console.dir(emailCode);
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

    return (
        <AuthenticatedUserContext.Provider value={currentUser}>
            {renderApplication(
                <React.Fragment>
                    {!currentUser.emailIsValidated ? <NonValidatedEmailMessage currentUser={currentUser} refetchUser={refetch} /> : null}
                    {children}
                </React.Fragment>
            )}
        </AuthenticatedUserContext.Provider>
    );
};