import { useMemo } from 'react';
import gql from 'graphql-tag';
import { useMutation } from 'react-apollo-hooks';

export default (instanceType, opts = {}) => {

    const createTaskMutation = useMemo(() => {

        return gql`
            mutation CreateSubmission {
                create${instanceType.name} {
                id
                tasks {
                    id
                    formKey
                }
            }
        }`
    }, [instanceType]);

    const mutation = useMutation(createTaskMutation, opts);

    return function wrappedCreateTaskMutation() {
        return mutation(...arguments).then(result => {
            return (result && result.data) ? result.data[`create${instanceType.name}`] : null;
        });
    };
};


