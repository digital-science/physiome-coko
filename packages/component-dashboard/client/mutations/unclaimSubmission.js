import gql from 'graphql-tag';
import { useMutation } from 'react-apollo-hooks';

export default (taskType, opts = {}) => {

    const unclaimSubmissionMutation = gql`
        mutation UnclaimSubmission($id:ID) {
          result: unclaim${taskType}(id:$id)
        }
    `;

    const mutation = useMutation(unclaimSubmissionMutation, opts);

    return function wrappedUnclaimSubmissionMutation(id) {

        const combinedOpts = Object.assign({}, opts);
        combinedOpts.variables = { id };

        return mutation(combinedOpts).then(result => {
            return (result && result.data) ? result.data.result : null;
        });
    };
};


