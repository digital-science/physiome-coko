import gql from 'graphql-tag';
import { useMutation } from 'react-apollo-hooks';

const createFileUploadSignedUrlMutation = gql`
    mutation createFileUploadSignedUrl($input:CreateFileUploadSignedUrlInput!) {
      file: createFileUploadSignedUrl(input:$input) {
        signedUrl
        fileId
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