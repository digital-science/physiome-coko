import gql from 'graphql-tag';
import { useQuery } from 'react-apollo-hooks';

export default (active, opts = {}) => {

    const queryOptions = {
        suspend: false,
        fetchPolicy: 'network-only'
    };

    Object.assign(queryOptions, opts);
    Object.assign(queryOptions, {
        variables: {
            active
        }
    });

    const getAwardSubmissionsQuery = gql`
query GetSubmissions($active:Boolean) {
  submissions: submissions(active:$active) {
    id
    title
    authors
    phase
    submissionDate
    submitter {
        id
        type
        identityId
        displayName
    }
    curator {
        id
        displayName
    }
    tasks {
        id
        formKey
    }
  }
}
`;

    return useQuery(getAwardSubmissionsQuery, queryOptions);
};

