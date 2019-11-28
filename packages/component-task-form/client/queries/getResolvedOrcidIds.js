import { useMemo } from 'react';
import gql from 'graphql-tag';
import { useQuery } from 'react-apollo-hooks';


export default (orcidIds, opts = {}) => {

    if(!orcidIds || !orcidIds.length) {
        return {};
    }

    const queryOptions = useMemo(() => {

        const queryOptions = {
            ssr: false,
            suspend: false,
            fetchPolicy: 'network-only'
        };
        Object.assign(queryOptions, opts);
        Object.assign(queryOptions, {
            variables: {
                ids: orcidIds || []
            }
        });
        return queryOptions;


    }, [opts]);

    const getResolvedOrcidIdsQuery = gql`
        query ResolveORCIDPersonDetails($ids:[ID!]!) {
            result:resolveORCIDPersonDetails(ids:$ids) {
                orcidId
                givenNames
                familyNames
            }
        }
    `;

    const {data, loading, error} =  useQuery(getResolvedOrcidIdsQuery, queryOptions);

    if(loading) {
        return null;
    }

    if(error || !data || !data.result) {
        return {};
    }

    const r = {};

    data.result.forEach(item => {
        r[item.orcidId] = item;
    });

    return r;
};