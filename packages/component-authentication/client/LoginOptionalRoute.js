import React from "react";

import LoginRequiredMessage from './LoginRequiredMessage';
import LoginEmailRequiredMessage from './LoginEmailRequiredMessage';

import NonValidatedEmailMessage from "./NonValidatedEmailMessage";
import SuccessfullyValidatedEmailMessage from './SuccessfullyValidatedEmailMessage';

import useCurrentUser, { EmailValidationOutcome } from "./withCurrentUser";
import withCurrentUserModified from './withCurrentUserModified';
import AuthenticatedUserContext from "./AuthenticatedUserContext";

import { findEmailCodeInLocationHash } from './utils'


export default ({renderApplication, renderContent, children}) => {

    // If the URL hash includes an email validation code, we want to pass that onto the "current user" request.

    const emailValidationCode = findEmailCodeInLocationHash(window.location.hash);

    const { currentUser, emailValidationTokenOutcome, error, loading, refetch } = useCurrentUser(emailValidationCode ? `${emailValidationCode}` : null);
    withCurrentUserModified((data) => {
        refetch();
    });

    if(error || loading) {
        return null;
    }

    // FIXME: this maybe required in this context still
    /*if(!currentUser.email) {
        return (
            <AuthenticatedUserContext.Provider value={currentUser}>
                {renderApplication(
                    <LoginEmailRequiredMessage currentUser={currentUser} refetchUser={refetch} />
                )}
            </AuthenticatedUserContext.Provider>
        );
    }*/

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