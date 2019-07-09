import gql from 'graphql-tag';
import { useSubscription } from 'react-apollo-hooks';

const useCurrentUserModifiedSubscription = (notifier, opts = {}) => {

    const modifiedIdentitySubscriptionQuery = gql`
subscription {
  modifiedId: modifiedIdentity
}`;

    return useSubscription(modifiedIdentitySubscriptionQuery, {
        onSubscriptionData: ({client, subscriptionData}) => {
            notifier(subscriptionData.data.modifiedId);
        },
        ...opts
    });
};

export default useCurrentUserModifiedSubscription;