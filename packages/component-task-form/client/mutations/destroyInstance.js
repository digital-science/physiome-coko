import gql from 'graphql-tag';
import { useMutation } from 'react-apollo-hooks';
import { useMemo } from 'react';


function _generateGraphQL(instanceType) {
    const instanceTypeName = instanceType.name;
    return gql`
        mutation DestroyInstance($id:ID, $state:${instanceTypeName}StateInput) {
          result: destroy${instanceTypeName}(id:$id, state:$state)
        }
    `;
}


export default (instanceType, opts = {}) => {

    const destroyInstanceMutation = useMemo(() => _generateGraphQL(instanceType), [instanceType, instanceType.name]);
    const mutation = useMutation(destroyInstanceMutation);

    return function wrappedDestroyInstanceMutation(id, state) {

        const combinedOpts = Object.assign({}, opts);
        combinedOpts.variables = {
            id,
            state: state || {}
        };

        return mutation(combinedOpts).then(result => {
            return (result && result.data) ? result.data.result : null;
        });
    };
};

