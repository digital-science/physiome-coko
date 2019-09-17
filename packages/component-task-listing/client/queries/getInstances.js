import { useMemo } from 'react';
import gql from 'graphql-tag';
import { useQuery } from 'react-apollo-hooks';

import { fetchFieldsToGraphQL } from 'component-task-form/client/utils/helpers'


export default (instanceType, dependentFields, variables, additionalQueryFields = null, opts = {}) => {

    const queryOptions = {
        suspend: false,
        fetchPolicy: 'network-only'
    };

    Object.assign(queryOptions, opts);
    Object.assign(queryOptions, {
        variables
    });

    const fields = useMemo(() => {
        return fetchFieldsToGraphQL(Object.assign({id: null}, dependentFields || {}));
    }, [dependentFields]);

    const query = useMemo(() => {

        const keys = (additionalQueryFields ? Object.keys(additionalQueryFields) : []).filter(key => additionalQueryFields.hasOwnProperty(key) && additionalQueryFields[key]);
        const additionalMethodParams = keys.length ? keys.map(key => "$" + `${key}:${additionalQueryFields[key]}`).join(", ") : null;
        const additionalParamValues = keys.length ? keys.map(key => `${key}:` + "$" + `${key}`).join(",") : null;

        return gql`
            query GetInstances($first:Int, $offset:Int, $filter:${instanceType.name}ListingFilterInput, $sorting:${instanceType.name}ListingSortingInput ${additionalMethodParams ? `, ${additionalMethodParams}` : ``}) {
                results: ${instanceType.listingAccessor}(first:$first, offset:$offset, filter:$filter, sorting:$sorting ${additionalParamValues ? `, ${additionalParamValues}` : ``}) {
                    results {
                        ${fields}
                    }
                    pageInfo {
                        pageSize
                        totalCount
                        offset
                    }
                }
            }
        `;

    }, [fields, instanceType, additionalQueryFields]);

    return useQuery(query, queryOptions);
};

