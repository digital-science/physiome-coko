import LoginRequiredMessage from './LoginRequiredMessage';
import LoginEmailRequiredMessage from './LoginEmailRequiredMessage';

import NonValidatedEmailMessage from "component-authentication/client/NonValidatedEmailMessage";

import useCurrentUser from "component-authentication/client/withCurrentUser";
import AuthenticatedUserContext from "component-authentication/client/AuthenticatedUserContext";
import React from "react";

export default ({message, children}) => {

    const { currentUser, error, loading, refetch } = useCurrentUser();
    if(error || loading) {
        return null;
    }

    if(!currentUser) {
        return (
            <AuthenticatedUserContext.Provider value={currentUser}>
                <LoginRequiredMessage message={message} />
            </AuthenticatedUserContext.Provider>
        );
    }

    if(!currentUser.email) {
        return (
            <AuthenticatedUserContext.Provider value={currentUser}>
                <LoginEmailRequiredMessage currentUser={currentUser} refetchUser={refetch} />
            </AuthenticatedUserContext.Provider>
        );
    }

    return (
        <React.Fragment>
            <AuthenticatedUserContext.Provider value={currentUser}>
                {!currentUser.emailIsValidated ? <NonValidatedEmailMessage currentUser={currentUser} refetchUser={refetch} /> : null}
                {children}
            </AuthenticatedUserContext.Provider>
        </React.Fragment>
    );
};