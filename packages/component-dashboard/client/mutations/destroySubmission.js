import gql from 'graphql-tag';
import { useMutation } from 'react-apollo-hooks';

export default (taskType, opts = {}) => {

    const destroySubmissionMutation = gql`
        mutation DestroySubmission($id:ID, $state:${taskType}StateInput) {
          result: destroy${taskType}(id:$id, state:$state)
        }
    `;

    const mutation = useMutation(destroySubmissionMutation, opts);

    return function wrappedDestroySubmissionMutation(id, state) {

        const combinedOpts = Object.assign({}, opts);
        combinedOpts.variables = {
            id,
            state: state || {}
        };

        return mutation(combinedOpts).then(result => {
            return (result && result.data) ? result.data.result : null;
        });
    };
};


