import gql from 'graphql-tag';
import { useMutation } from 'react-apollo-hooks';

export default (taskType, opts = {}) => {

    const restartRejectedSubmissionMutation = gql`
        mutation RestartRejectedSubmission($id:ID) {
          result: restartRejected${taskType}(id:$id)
        }
    `;

    const mutation = useMutation(restartRejectedSubmissionMutation, opts);

    return function wrappedRestartRejectedSubmissionMutation(id) {

        const combinedOpts = Object.assign({}, opts);
        combinedOpts.variables = { id };

        return mutation(combinedOpts).then(result => {
            return (result && result.data) ? result.data.result : null;
        });
    };
};


