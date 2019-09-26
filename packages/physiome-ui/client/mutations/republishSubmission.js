import gql from 'graphql-tag';
import { useMutation } from 'react-apollo-hooks';
import { useMemo } from 'react';

export default (instanceType, opts = {}) => {

    const republishSubmissionMutation = useMemo(() => {
        return gql`
            mutation RepublishSubmission($id:ID) {
              result: republish${instanceType.name}(id:$id)
            }
        `;
    }, [instanceType]);

    const mutation = useMutation(republishSubmissionMutation, opts);

    return function wrappedRepublishSubmissionMutation(id) {

        const combinedOpts = Object.assign({}, opts);
        combinedOpts.variables = { id };

        return mutation(combinedOpts).then(result => {
            return (result && result.data) ? result.data.result : null;
        });
    };
};


