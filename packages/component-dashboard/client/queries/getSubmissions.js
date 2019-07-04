import gql from 'graphql-tag';
import { useQuery } from 'react-apollo-hooks';

export default (first, offset, filter, sorting, opts = {}) => {

    const queryOptions = {
        suspend: false,
        fetchPolicy: 'network-only'
    };

    Object.assign(queryOptions, opts);
    Object.assign(queryOptions, {
        variables: {
            first,
            offset,
            filter,
            sorting
        }
    });

    const getSubmissionsQuery = gql`
query GetSubmissions($first:Int, $offset:Int, $filter:SubmissionListingFilterInput, $sorting:SubmissionListingSortingInput) {
  submissions: submissions(first:$first, offset:$offset, filter:$filter, sorting:$sorting) {
    results {
      id
      manuscriptId
      title
      authors
      phase
      hidden
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
    } 
    pageInfo {
      pageSize
      totalCount
      offset
    }
  }
}
`;

    return useQuery(getSubmissionsQuery, queryOptions);
};

