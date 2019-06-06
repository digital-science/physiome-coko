import gql from 'graphql-tag';
import { useMutation } from 'react-apollo-hooks';

export default (taskType, opts = {}) => {

    const claimSubmissionMutation = gql`
        mutation ClaimSubmission($id:ID) {
          result: claim${taskType}(id:$id)
        }
    `;

    const mutation = useMutation(claimSubmissionMutation, opts);

    return function wrappedClaimSubmissionMutation(id) {

        const combinedOpts = Object.assign({}, opts);
        combinedOpts.variables = { id };

        return mutation(combinedOpts).then(result => {
            return (result && result.data) ? result.data.result : null;
        });
    };
};


