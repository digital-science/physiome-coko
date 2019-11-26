import { useEffect, useContext } from 'react';
import gql from 'graphql-tag';
import { useQuery } from 'react-apollo-hooks';
import AuthenticationTokenContext from "./AuthenticationTokenContext";

const EmailValidationOutcome = {
    Successful: 'Successful',
    InvalidToken: 'InvalidToken',
    ExpiredToken: 'ExpiredToken'
};

export default (emailValidationToken = null, opts = {}) => {

    const queryOptions = {
        suspend: false
        //fetchPolicy: 'network-only'
    };

    Object.assign(queryOptions, opts);
    Object.assign(queryOptions, {
        variables: {
            emailValidationToken
        }
    });

    const getCurrentUser = gql`
query CurrentUser($emailValidationToken:String) {
  currentUser(emailValidationToken:$emailValidationToken) {
    user {
      id
      username
      groups
      email
      emailIsValidated
      hasPendingEmailValidation
      emailValidationTokenExpire
    }
    emailValidationTokenOutcome
  }
}`;

    const r = useQuery(getCurrentUser, queryOptions);
    const authContext = useContext(AuthenticationTokenContext);

    useEffect(() => {
        const handleLocalStorageChanged = (e) => {
            if(r.refetch && e.key === "token") {
                r.refetch();
            }
        };

        window.addEventListener('storage', handleLocalStorageChanged);

        return () => {
            window.removeEventListener('storage', handleLocalStorageChanged);
        };
    });

    if(r.data) {

        if(r.data.currentUser && localStorage.getItem('token')) {

            r.currentUser = r.data.currentUser.user;
            r.emailValidationTokenOutcome = r.data.currentUser.emailValidationTokenOutcome || null;

        } else if(r.data.currentUser === null) {

            // If the current user is null (after a successful request), and the local storage provided
            // a token, and it matches the current auth context token,
            if(authContext.token && authContext.token === localStorage.getItem('token')) {
                console.info(`Auth token is invalid, removing local storage entry for token.`);
                window.localStorage.removeItem("token");
            }
        }
    }


    return r;
};


export { EmailValidationOutcome };