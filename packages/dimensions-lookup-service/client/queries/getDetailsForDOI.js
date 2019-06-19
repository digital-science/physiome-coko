import gql from 'graphql-tag';
import { useApolloClient } from 'react-apollo-hooks';
import { deepRemoveKeys } from '../utils/utils'
import { cloneDeep } from 'lodash';

export default () => {

    const queryOptions = {
        ssr: false,
        suspend: false,
        fetchPolicy: 'network-only'
    };

    const getDetailsForDOIQuery = gql`
query DetailsForDOI($doi:String!) {
  details: detailsForDOI(doi:$doi) {
    id
    doi
    title
    issue
    volume
    pages
    year
    link
    type
    authors {
      id
      researcherId
      firstName
      lastName
    }   
  }
}
`;

    const client = useApolloClient();
    const perform = (doi) => {

        const opts = Object.assign({query:getDetailsForDOIQuery}, queryOptions);
        opts.variables = {doi};

        return client.query(opts).then(r => {

            if(r && r.data && r.data.details) {
                const copy = cloneDeep(r.data.details);
                deepRemoveKeys(copy, '__typename');
                return copy;
            }

            return null;
        });
    };

    return [perform];
};