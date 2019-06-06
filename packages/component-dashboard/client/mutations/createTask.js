import gql from 'graphql-tag';
import { useMutation } from 'react-apollo-hooks';

export default (taskType, opts = {}) => {

    const createTaskMutation = gql`
mutation CreateSubmission {
  create${taskType} {
    id
    tasks {
      id
      formKey
    }
  }
}
`;

    const mutation = useMutation(createTaskMutation, opts);

    return function wrappedCreateTaskMutation() {
        return mutation(...arguments).then(result => {
            return (result && result.data) ? result.data[`create${taskType}`] : null;
        });
    };
};


