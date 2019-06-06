import gql from 'graphql-tag';
import { useMutation } from 'react-apollo-hooks';
import { useMemo } from 'react';


function _generateGraphQL(instanceType) {
    return gql`
        mutation UpdateInstance($input:${instanceType.name}Input) {
          update: update${instanceType.name}(input:$input)
        }`;
}


export default (instanceType, opts = {}) => {

    const updateInstanceMutation = useMemo(() => _generateGraphQL(instanceType), [instanceType, instanceType.name]);
    const mutation = useMutation(updateInstanceMutation);

    return function wrappedUpdateInstanceMutation(input) {

        const combinedOpts = Object.assign({}, opts);
        combinedOpts.variables = {input};

        return mutation(combinedOpts).then(result => {
            return (result && result.data) ? result.data.update : null;
        });
    };
};

