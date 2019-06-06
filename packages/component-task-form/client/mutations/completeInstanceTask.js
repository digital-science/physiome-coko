import gql from 'graphql-tag';
import { useMutation } from 'react-apollo-hooks';
import { useMemo } from 'react';


function _generateGraphQL(instanceType) {
    const instanceTypeName = instanceType.name;
    return gql`
        mutation CompleteInstanceTask($id:ID, $taskId:ID, $state:${instanceTypeName}StateInput) {
          complete: completeTaskFor${instanceTypeName}(id:$id, taskId:$taskId, state:$state)
        }
    `;
}


export default (instanceType, opts = {}) => {

    const completeInstanceTaskMutation = useMemo(() => _generateGraphQL(instanceType), [instanceType, instanceType.name]);
    const mutation = useMutation(completeInstanceTaskMutation);

    return function wrappedCompleteInstanceTaskMutation(id, taskId, state) {

        const combinedOpts = Object.assign({}, opts);
        combinedOpts.variables = {
            id,
            taskId,
            state: state || {}
        };

        return mutation(combinedOpts).then(result => {
            return (result && result.data) ? result.data.complete : null;
        });
    };
};

