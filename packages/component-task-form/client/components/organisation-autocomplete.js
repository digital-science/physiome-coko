import React from 'react';
import styled from 'styled-components';

import { AutocompleteEntity, SmallAutocompleteEntity } from 'ds-theme/components/autocomplete-entity';
import { MenuHolder, MenuItem, MenuHeader, MenuFooter } from 'ds-theme/components/autocomplete';
import Spinner from "ds-theme/components/spinner";
import { th } from "ds-theme";

import RorLogoSmall from '../static/ror-logo-small.png';


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

const OrganisationMenuHolder = styled(MenuHolder)`  
  & > ${LookupProviderHeader} + * {
    margin-top: 2px;
    border-top: 1px dashed lightgray;
  }
  & > * + ${LookupProviderNote} {
    margin-top: 2px;
    border-top: 1px dashed lightgray;
  }
  
  & > ${MenuItem} {
    .acronyms {
      color: #909090;
      font-style: italic;
    }
    .acronyms:before {
      content: " ("
    }
    .acronyms:after {
      content: ")"
    }
    
    .country {
      color: #909090;
    }
    .country:before {
      content: " - "
    }
  }
`;


const organisationEntityModifier = (entity) => {

    const orgEntity = {id:entity.id, name:entity.name};

    if(entity.country) {
        orgEntity.country = entity.country;
    }

    if(entity.external_ids) {

        const { GRID, FundRef } = entity.external_ids;

        if(GRID && GRID.preferred) {
            orgEntity.grid_id = GRID.preferred;
        }

        if(FundRef && FundRef.all && FundRef.all instanceof Array && FundRef.all.length) {
            orgEntity.fund_ref_id = FundRef.all[0];
        }
    }

    return orgEntity;
};

function organisationEntityLookup(value, maxItems=15) {

    if(!value || !value.length) {
        return new Promise(resolve => {
            setTimeout(() => {
                return resolve([]);
            }, 0);
        });
    }

    const qp = {};

    qp.page = "1";
    qp.query = encodeURIComponent(value);

    const q = Object.keys(qp).map(k => `${k}=${qp[k]}`).join("&");
    const url = `https://api.ror.org/organizations?${q}`;

    return fetch(url).then(function(response) {
        return response.json();
    }).then(function(r) {
        return (r.items || []).slice(0, maxItems);
    });
}

const renderOrganisationMenuItem = ({item, index, isSelected}, MenuItemComponent) =>
    <MenuItemComponent key={item.id} className={isSelected ? "selected" : ""}>
        {item.name}
        {item.acronyms && item.acronyms.length ? <span className="acronyms">{item.acronyms[0]}</span> : null}
        {item.country && item.country.country_name ? <span className="country">{item.country.country_name}</span> : null}
    </MenuItemComponent>;

const renderOrganisationMenuHeader = (loading) => loading ? (
    <LookupProviderHeader>
        <Spinner message="Loading…" small={true} />
    </LookupProviderHeader>
) : null;

const renderOrganisationMenuFooter = (loading) => (
    <LookupProviderNote>
        <div><img src={RorLogoSmall} alt="ROR logo" /> Organisation lookup data sourced via ROR</div>
    </LookupProviderNote>
);


const CountryCodeSpan = styled.span`
  font-style: italic;
  &:before {
    content: " (";
  }
  &:after {
    content: ")";
  }
`;

const renderOrganisationValueRepresentation = (organisationEntity) =>
    <React.Fragment>
        {organisationEntity.name}
        {organisationEntity.country && organisationEntity.country.country_code ? <CountryCodeSpan>{organisationEntity.country.country_code}</CountryCodeSpan> : null}
    </React.Fragment>;


const OrganisationAutocomplete = ({entityModifier=organisationEntityModifier, lookupItems=organisationEntityLookup,
                                   renderMenuItem=renderOrganisationMenuItem, renderEntityValueRepresentation=renderOrganisationValueRepresentation,
                                   renderMenuHeader=renderOrganisationMenuHeader, renderMenuFooter=renderOrganisationMenuFooter,
                                   menuHolderComponent=OrganisationMenuHolder, autocompleteEntityComponent=AutocompleteEntity, ...props}) => {

    const AutocompleteEntityComponent = autocompleteEntityComponent;

    return (
        <AutocompleteEntityComponent entityModifier={entityModifier} lookupItems={lookupItems}
            menuHolderComponent={menuHolderComponent} renderMenuItem={renderMenuItem}
            renderMenuHeader={renderMenuHeader} renderMenuFooter={renderMenuFooter}
            renderEntityValueRepresentation={renderEntityValueRepresentation} {...props} />
    );
};

const SmallOrganisationAutocomplete = ({autocompleteEntityComponent=SmallAutocompleteEntity, ...rest}) => {

    return <OrganisationAutocomplete autocompleteEntityComponent={autocompleteEntityComponent} {...rest} />;
};

export default OrganisationAutocomplete;
export { OrganisationAutocomplete, SmallOrganisationAutocomplete };

export { organisationEntityLookup, organisationEntityModifier };