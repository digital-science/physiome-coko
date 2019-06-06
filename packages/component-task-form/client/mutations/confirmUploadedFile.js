import gql from 'graphql-tag';
import { useMutation } from 'react-apollo-hooks';

const createFileUploadSignedUrlMutation = gql`
    mutation ConfirmFile($input:ConfirmFileUploadInput) {
        file: confirmFileUpload(input:$input) {
            id
            fileName
            fileDisplayName
            fileMimeType
            fileByteSize
            order
        }
    }
`;

export default (opts = {}) => {

    const mutation = useMutation(createFileUploadSignedUrlMutation, opts);

    return function wrappedCreateFileUploadSignedUrlMutation(input) {

        const options = Object.assign({}, opts);
        options.variables = {input};

        return mutation(options).then(result => {
            return (result && result.data) ? result.data.file : null;
        });
    };
};