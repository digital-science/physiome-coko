import gql from 'graphql-tag';
import { useMutation } from 'react-apollo-hooks';
import { useMemo } from 'react';

export default (instanceType, opts = {}) => {

    const unclaimSubmissionMutation = useMemo(() => {
        return gql`
            mutation UnclaimSubmission($id:ID) {
              result: unclaim${instanceType.name}(id:$id)
            }
        `;
    }, [instanceType]);

    const mutation = useMutation(unclaimSubmissionMutation, opts);

    return function wrappedUnclaimSubmissionMutation(id) {

        const combinedOpts = Object.assign({}, opts);
        combinedOpts.variables = { id };

        return mutation(combinedOpts).then(result => {
            return (result && result.data) ? result.data.result : null;
        });
    };
};


