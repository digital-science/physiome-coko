import gql from 'graphql-tag';
import { useApolloClient } from 'react-apollo-hooks';

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
                const t = Object.assign({}, grant);
                delete t['__typename'];
                return t;
            }) : [];
        });
    };

    return [perform];
};