import { useEffect } from 'react';
import gql from 'graphql-tag';
import { useQuery } from 'react-apollo-hooks';

export default (active, opts = {}) => {

    const queryOptions = {
        suspend: false
        //fetchPolicy: 'network-only'
    };

    Object.assign(queryOptions, opts);
    Object.assign(queryOptions, {
        variables: {
            active
        }
    });

    const getCurrentUser = gql`
query {
  currentUser {
    id
    username
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

    if(r.data) {
        r.currentUser = r.data.currentUser;
    }
    return r;
};

