import gql from 'graphql-tag';
import { useSubscription } from 'react-apollo-hooks';

const useSubmissionWasCreatedSubscription = (notifier, opts = {}) => {

    const submissionCreatedSubscriptionQuery = gql`
subscription {
  createdId: createdSubmission
}`;

    return useSubscription(submissionCreatedSubscriptionQuery, {
        onSubscriptionData: ({client, subscriptionData}) => {
            notifier(subscriptionData.data.createdId);
        },
        ...opts
    });
};

const useSubmissionWasModifiedSubscription = (notifier, opts = {}) => {

    const submissionModifiedSubscriptionQuery = gql`
subscription {
  modifiedId: modifiedSubmission
}`;

    return useSubscription(submissionModifiedSubscriptionQuery, {
        onSubscriptionData: ({client, subscriptionData}) => {
            notifier(subscriptionData.data.modifiedId);
        },
        ...opts
    });
};



export { useSubmissionWasCreatedSubscription, useSubmissionWasModifiedSubscription };