import { useMemo } from 'react';
import gql from 'graphql-tag';
import { useSubscription } from 'react-apollo-hooks';


const useSubmissionPublishedSubscription = (notifier, opts = {}) => {

    const query = useMemo(() => {
        return gql`
            subscription {
                publishedId: publishedSubmission
            }
        `;
    }, []);

    return useSubscription(query, {
        onSubscriptionData: ({client, subscriptionData}) => {
            notifier(subscriptionData.data.publishedId);
        },
        ...opts
    });
};


export { useSubmissionPublishedSubscription };