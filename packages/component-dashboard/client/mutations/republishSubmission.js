import gql from 'graphql-tag';
import { useMutation } from 'react-apollo-hooks';

export default (taskType, opts = {}) => {

    const republishSubmissionMutation = gql`
        mutation RepublishSubmission($id:ID) {
          result: republish${taskType}(id:$id)
        }
    `;

    const mutation = useMutation(republishSubmissionMutation, opts);

    return function wrappedRepublishSubmissionMutation(id) {

        const combinedOpts = Object.assign({}, opts);
        combinedOpts.variables = { id };

        return mutation(combinedOpts).then(result => {
            return (result && result.data) ? result.data.result : null;
        });
    };
};


