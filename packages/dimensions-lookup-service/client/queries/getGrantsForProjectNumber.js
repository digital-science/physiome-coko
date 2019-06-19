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

    const getInstanceQuery = gql`
query GetGrantsForProjectNumber($projectNumber:String) {
  grants: grantsForProjectNumber(projectNumber:$projectNumber) {
    id
    title
    funders
    startYear
    link
    projectNumber
  }
}
`;

    const client = useApolloClient();
    const perform = (projectNumber) => {

        const opts = Object.assign({query:getInstanceQuery}, queryOptions);
        opts.variables = {projectNumber};

        return client.query(opts).then(r => {
            return (r && r.data && r.data.grants) ? r.data.grants.map(grant => {
                const copy = cloneDeep(grant);
                deepRemoveKeys(copy, '__typename');
                return copy;
            }) : [];
        });
    };

    return [perform];
};