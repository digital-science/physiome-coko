import gql from 'graphql-tag';
import { useMutation } from 'react-apollo-hooks';

import { EmailConfirmationOutcome } from './withConfirmCurrentUserEmail'

const resendCurrentUserEmailValidationMutation = gql`
    mutation ResendCurrentUserEmailValidation($email : String) {
        result: resendCurrentUserEmailValidation(email : $email)
    }
`;


export default (opts = {}) => {

    const mutation = useMutation(resendCurrentUserEmailValidationMutation, opts);

    return function wrappedResendCurrentUserEmailValidationMutation(email) {

        const options = Object.assign({}, opts);
        options.variables = {email};

        return mutation(options).then(result => {
            return (result && result.data) ? result.data.result : null;
        });
    };
};

export { EmailConfirmationOutcome };