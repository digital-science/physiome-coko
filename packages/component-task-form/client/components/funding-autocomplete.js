import React from 'react';
import styled from 'styled-components';

import useGetGrantsForProjectNumber from 'dimensions-lookup-service/client/queries/getGrantsForProjectNumber';

import { AutocompleteEntity, SmallAutocompleteEntity } from 'ds-theme/components/autocomplete-entity';
import { MenuHolder, MenuHeader, MenuFooter } from 'ds-theme/components/autocomplete';
import Spinner from "ds-theme/components/spinner";
import { th } from "ds-theme";

import DimensionsLogo from "../static/dimensions-logo.svg";


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

const getGrantItemValue = (grant) => grant.projectNumber;

//renderEntityValueRepresentation=renderGrantValueRepresentation

const FundingAutocomplete = ({entityModifier=grantEntityModifier, lookupItems, getItemValue=getGrantItemValue, menuHolderComponent=FundingMenuHolder,
                              renderMenuItem=renderGrantMenuItem, renderMenuHeader=renderGrantMenuHeader,
                              renderMenuFooter=renderGrantMenuFooter, autocompleteEntityComponent=AutocompleteEntity, ...props}) => {

    const [lookupGrantsForProjectNumber] = useGetGrantsForProjectNumber();
    const grantLookup = (value, maxItems=15) => {
        if(!value || !value.length) {
            return new Promise(resolve => {
                setTimeout(() => {
                    return resolve([]);
                }, 0);
            });
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

