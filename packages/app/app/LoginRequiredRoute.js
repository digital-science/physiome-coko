import LoginRequiredMessageComponent from './LoginRequiredMessageComponent';
import useCurrentUser from "component-authentication/client/withCurrentUser";
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

    return <React.Fragment>{children}</React.Fragment>;
};