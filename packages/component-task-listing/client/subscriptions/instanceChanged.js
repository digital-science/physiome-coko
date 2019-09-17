import { useMemo } from 'react';
import gql from 'graphql-tag';
import { useSubscription } from 'react-apollo-hooks';

const useInstanceWasCreatedSubscription = (instanceType, notifier, opts = {}) => {

    const query = useMemo(() => {
        return gql`
            subscription {
                createdId: created${instanceType.name}
            }
        `;
    }, [instanceType]);

    return useSubscription(query, {
        onSubscriptionData: ({client, subscriptionData}) => {
            notifier(subscriptionData.data.createdId);
        },
        ...opts
    });
};

const useInstanceWasModifiedSubscription = (instanceType, notifier, opts = {}) => {

    const query = useMemo(() => {
        return gql`
            subscription {
                modifiedId: modified${instanceType.name}
            }
        `;
    }, [instanceType]);

    return useSubscription(query, {
        onSubscriptionData: ({client, subscriptionData}) => {
            notifier(subscriptionData.data.modifiedId);
        },
        ...opts
    });
};



export { useInstanceWasCreatedSubscription, useInstanceWasModifiedSubscription };