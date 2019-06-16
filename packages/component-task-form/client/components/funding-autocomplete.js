import React from 'react';
import styled from 'styled-components';

import useGetGrantsForProjectNumber from '../queries/getGrantsForProjectNumber';

import { EntityAutocomplete, MenuItem, ApplySmallAutocompleteStyle } from "ds-awards-theme/components/entity-autocomplete";

const grantEntityModifier = (entity) => {
    return entity;
};

const FunderMenuItem = styled(MenuItem)`
`;


const renderGrantMenuItem = (item, isHighlighted) =>
    <FunderMenuItem key={item.id} className={isHighlighted ? "selected" : ""}>
        {item.projectNumber} &mdash; {item.title}
    </FunderMenuItem>;


const renderGrantValueRepresentation = (grantEntity) =>
    <React.Fragment>
        {grantEntity.projectNumber}
    </React.Fragment>;

const getGrantItemValue = (grant) => grant.projectNumber;


const FundingAutocomplete = ({entityModifier=grantEntityModifier, entityLookup, getItemValue=getGrantItemValue,
                              renderItem=renderGrantMenuItem, renderEntityValueRepresentation=renderGrantValueRepresentation,
                              ...props}) => {

    const [lookupGrantsForProjectNumber] = useGetGrantsForProjectNumber();
    const grantLookup = (value, maxItems=15) => {
        return lookupGrantsForProjectNumber(value).catch(e => []);
    };

    return (
        <EntityAutocomplete entityModifier={entityModifier} getItemValue={getItemValue} entityLookup={entityLookup || grantLookup}
            renderItem={renderItem} renderEntityValueRepresentation={renderEntityValueRepresentation} {...props} />
    );
};

export default FundingAutocomplete;

const SmallFundingAutocomplete = ApplySmallAutocompleteStyle(FundingAutocomplete);

export { SmallFundingAutocomplete };