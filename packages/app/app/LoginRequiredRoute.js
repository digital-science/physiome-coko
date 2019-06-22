import LoginRequiredMessageComponent from './LoginRequiredMessageComponent';
import useCurrentUser from "component-authentication/client/withCurrentUser";
import AuthenticatedUserContext from "component-authentication/client/AuthenticatedUserContext";
import React from "react";

export default ({message, children}) => {

    const { currentUser, error, loading } = useCurrentUser();
    if(error || loading) {
        return null;
    }

    if(!currentUser) {
        return (
            <LoginRequiredMessageComponent message={message} />
        );
    }

    return (
        <React.Fragment>
            <AuthenticatedUserContext.Provider value={currentUser}>
                {children}
            </AuthenticatedUserContext.Provider>
        </React.Fragment>
    );
};