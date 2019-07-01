import gql from 'graphql-tag';
import { useMutation } from 'react-apollo-hooks';

const confirmCurrentUserEmailMutation = gql`
    mutation ConfirmCurrentUserEmail($email : String!) {
        result: confirmCurrentUserEmail(email : $email)
    }
`;

const EmailConfirmationOutcome = {
    NoUserLoggedIn: 'NoUserLoggedIn',
    AlreadyConfirmed: 'AlreadyConfirmed',
    InvalidEmailAddress: 'InvalidEmailAddress',
    ValidationSent: 'ValidationSent',
    TooManyValidationAttempts: 'TooManyValidationAttempts'
};


export default (opts = {}) => {

    const mutation = useMutation(confirmCurrentUserEmailMutation, opts);

    return function wrappedConfirmCurrentUserEmailMutation(email) {

        const options = Object.assign({}, opts);
        options.variables = {email};

        return mutation(options).then(result => {
            return (result && result.data) ? result.data.result : null;
        });
    };
};

export { EmailConfirmationOutcome };