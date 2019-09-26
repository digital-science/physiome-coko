import gql from 'graphql-tag';
import { useMutation } from 'react-apollo-hooks';
import { useMemo } from 'react';

export default (instanceType, opts = {}) => {

    const restartRejectedSubmissionMutation = useMemo(() => {
        return gql`
            mutation RestartRejectedSubmission($id:ID) {
                result: restartRejected${instanceType.name}(id:$id)
            }
        `;
    },[instanceType]);

    const mutation = useMutation(restartRejectedSubmissionMutation, opts);

    return function wrappedRestartRejectedSubmissionMutation(id) {

        const combinedOpts = Object.assign({}, opts);
        combinedOpts.variables = { id };

        return mutation(combinedOpts).then(result => {
            return (result && result.data) ? result.data.result : null;
        });
    };
};


