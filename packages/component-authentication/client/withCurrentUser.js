import { useEffect } from 'react';
import gql from 'graphql-tag';
import { useQuery } from 'react-apollo-hooks';

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

    if(r.data && r.data.currentUser) {
        r.currentUser = r.data.currentUser.user;
        r.emailValidationTokenOutcome = r.data.currentUser.emailValidationTokenOutcome || null;
    }
    return r;
};

