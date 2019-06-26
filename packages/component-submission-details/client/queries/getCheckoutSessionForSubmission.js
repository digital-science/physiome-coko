import gql from 'graphql-tag';
import { useApolloClient } from 'react-apollo-hooks';

export default (opts = {}) => {

    const queryOptions = {
        suspend: false,
        fetchPolicy: 'network-only'
    };
    Object.assign(queryOptions, opts);

    const getCheckoutSessionForSubmissionQuery = gql`
query GetCheckoutSessionForSubmission($submissionId:ID!) {
  session: checkoutSessionForSubmission(submissionId:$submissionId) {
    status
    sessionId
  }
}
`;

    const client = useApolloClient();

    const perform = (submissionId) => {

        const opts = Object.assign({query:getCheckoutSessionForSubmissionQuery}, queryOptions);
        opts.variables = {submissionId};

        return client.query(opts).then(r => {
            if(r && r.data && r.data.session) {
                return r.data.session;
            }
            return null;
        });
    };

    return [perform];
};

