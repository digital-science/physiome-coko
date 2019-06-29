import gql from 'graphql-tag';
import { useMutation } from 'react-apollo-hooks';

const confirmCurrentUserEmailMutation = gql`
    mutation ConfirmCurrentUserEmail($email : String!) {
        confirmed: confirmCurrentUserEmail(email : $email)
    }
`;

export default (opts = {}) => {

    const mutation = useMutation(confirmCurrentUserEmailMutation, opts);

    return function wrappedConfirmCurrentUserEmailMutation(email) {

        const options = Object.assign({}, opts);
        options.variables = {email};

        return mutation(options).then(result => {
            return (result && result.data) ? result.data.confirmed : null;
        });
    };
};