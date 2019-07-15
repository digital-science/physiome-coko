import React from 'react';
import styled from 'styled-components';

import useGetGrantsForProjectNumber from 'dimensions-lookup-service/client/queries/getGrantsForProjectNumber';
import Spinner from "ds-awards-theme/components/spinner";
import { th } from "ds-awards-theme";

//import { EntityAutocomplete, MenuItem, MenuHolder, ApplySmallAutocompleteStyle } from "ds-awards-theme/components/entity-autocomplete";
import DimensionsLogo from "../static/dimensions-logo.svg";

/*
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
        if(!value || !value.length) {
            return Promise.resolve([]);
        }
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

*/



import { AutocompleteEntity, SmallAutocompleteEntity } from 'ds-awards-theme/components/autocomplete-entity';
import { MenuHolder, MenuHeader, MenuFooter } from 'ds-awards-theme/components/autocomplete';

const LookupProviderHeader = styled(MenuHeader)`
`;

const LookupProviderNote = styled(MenuFooter)`
  font-family: ${th('autocomplete.item.fontFamily')};
  font-size: 10px;
  text-align: right;

  & img {
    height: 1.2em;
    vertical-align: middle;
  }  
`;

const FundingMenuHolder = styled(MenuHolder)`  
  & > ${LookupProviderHeader} + * {
    margin-top: 2px;
    border-top: 1px dashed lightgray;
  }
  & > * + ${LookupProviderNote} {
    margin-top: 2px;
    border-top: 1px dashed lightgray;
  }
`;

const grantEntityModifier = (entity) => entity;

const renderGrantMenuItem = ({item, index, isSelected}, MenuItemComponent) =>
    <MenuItemComponent key={item.id} className={isSelected ? "selected" : ""}>
        {item.projectNumber} &mdash; {item.title}
    </MenuItemComponent>;

const renderGrantMenuHeader = (loading) => loading ? (
    <LookupProviderHeader>
        <Spinner message="Loading…" small={true} />
    </LookupProviderHeader>
) : null;

const renderGrantMenuFooter = (loading) => (
    <LookupProviderNote>
        <div>Grant details sourced via <img src={DimensionsLogo} alt="Dimensions logo" /></div>
    </LookupProviderNote>
);


const renderGrantValueRepresentation = (grantEntity) =>
    <React.Fragment>
        {grantEntity.projectNumber}
    </React.Fragment>;

const getGrantItemValue = (grant) => grant.projectNumber;

//renderEntityValueRepresentation=renderGrantValueRepresentation

const FundingAutocomplete = ({entityModifier=grantEntityModifier, lookupItems, getItemValue=getGrantItemValue, menuHolderComponent=FundingMenuHolder,
                              renderMenuItem=renderGrantMenuItem, renderMenuHeader=renderGrantMenuHeader,
                              renderMenuFooter=renderGrantMenuFooter, autocompleteEntityComponent=AutocompleteEntity, ...props}) => {

    const [lookupGrantsForProjectNumber] = useGetGrantsForProjectNumber();
    const grantLookup = (value, maxItems=15) => {
        if(!value || !value.length) {
            return Promise.resolve([]);
        }
        return lookupGrantsForProjectNumber(value).catch(e => []);
    };

    const AutocompleteEntityComponent = autocompleteEntityComponent;

    return (
        <AutocompleteEntityComponent entityModifier={entityModifier} getItemValue={getItemValue} lookupItems={lookupItems || grantLookup} menuHolderComponent={menuHolderComponent}
            renderMenuItem={renderMenuItem} renderMenuHeader={renderMenuHeader} renderMenuFooter={renderMenuFooter} {...props} />
    );
};


const SmallFundingAutocomplete = ({autocompleteEntityComponent=SmallAutocompleteEntity, ...rest}) => {

    return <FundingAutocomplete autocompleteEntityComponent={autocompleteEntityComponent} {...rest} />;
};


export default FundingAutocomplete;
export { FundingAutocomplete, SmallFundingAutocomplete };

