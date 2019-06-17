import React from 'react';
import styled from 'styled-components';

import useGetGrantsForProjectNumber from '../queries/getGrantsForProjectNumber';

import { EntityAutocomplete, MenuItem, MenuHolder, ApplySmallAutocompleteStyle } from "ds-awards-theme/components/entity-autocomplete";
import DimensionsLogo from "../static/dimensions-logo.svg";


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

const LookupProviderNote = styled(MenuItem)`

  font-size: 10px;
  text-align: right;

  & img {
    height: 1.2em;
    vertical-align: middle;
  }  
`;

const FundingMenuHolder = styled(MenuHolder)`
  & > * + ${LookupProviderNote} {
    margin-top: 2px;
    border-top: 1px dashed lightgray;
  }
`;

const renderFundingMenu = function (items, value, style) {
    return (
        <FundingMenuHolder style={{ ...style, ...this.menuStyle }} children={items}>
            {items}
            <LookupProviderNote>
                Grant details sourced via <img src={DimensionsLogo} alt="Dimensions logo" />
            </LookupProviderNote>
        </FundingMenuHolder>
    );
};


const FundingAutocomplete = ({entityModifier=grantEntityModifier, entityLookup, getItemValue=getGrantItemValue,
                              renderItem=renderGrantMenuItem, renderEntityValueRepresentation=renderGrantValueRepresentation,
                              renderMenu=renderFundingMenu, ...props}) => {

    const [lookupGrantsForProjectNumber] = useGetGrantsForProjectNumber();
    const grantLookup = (value, maxItems=15) => {
        return lookupGrantsForProjectNumber(value).catch(e => []);
    };

    return (
        <EntityAutocomplete entityModifier={entityModifier} getItemValue={getItemValue} entityLookup={entityLookup || grantLookup}
            renderItem={renderItem} renderEntityValueRepresentation={renderEntityValueRepresentation} renderMenu={renderMenu} {...props} />
    );
};

export default FundingAutocomplete;

const SmallFundingAutocomplete = ApplySmallAutocompleteStyle(FundingAutocomplete);

export { SmallFundingAutocomplete };