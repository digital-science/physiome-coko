import React, { useState, useRef } from 'react';
import Autocomplete from 'react-autocomplete';
import styled from 'styled-components';

import useDebounce from '../hooks/useDebouncedValue'

import { BorderStyle } from "ds-awards-theme/components/bordered-element";

import RorIcon from '../static/ror-logo-small.png';


// Customisation to ensure suggestions don't show when the autocomplete is read-only mode.
class CustomisedAutocomplete extends Autocomplete {
    isOpen() {
        if('readOnly' in this.props && this.props.readOnly === true) {
            return false;
        }
        return super.isOpen();
    }

    handleInputClick() {
        if(this.props.readOnly) {
            return;
        }
        super.handleInputClick();
    }
}


function lookupAffiliations(value) {

    if(!value || !value.length) {
        return Promise.resolve([]);
    }

    const qp = {};

    qp.page = "1";
    qp.qp = "multiMatch";
    qp.query = encodeURIComponent(value);

    const q = Object.keys(qp).map(k => `${k}=${qp[k]}`).join("&");
    const url = `https://api.ror.org/organizations?${q}`;

    return fetch(url).then(function(response) {
        return response.json();
    }).then(function(r) {
        return r.items || [];
    });
}


const ItemHolder = styled.div`
    padding: 5px;
    background: white;
    cursor: pointer;
    
    &.selected {
      background: #b3e7ff;
    }
`;



function _AffiliationAutocomplete({className, readOnly, value, onChange, currentAffiliation}) {

    const generationRef = useRef(0);
    const displayedGenerationRef = useRef(0);

    const [debouncedItems] = useDebounce(value, 750, (query, setter) => {

        ++generationRef.current;
        const generation = generationRef.current;

        lookupAffiliations(query).then(items => {

            if(generation > displayedGenerationRef.current) {
                displayedGenerationRef.current = generation;
                setter(items);
            }
        });
    }, []);

    return (
        <div className={className}>
            <CustomisedAutocomplete
                getItemValue={(item) => item.name}
                items={debouncedItems}
                renderItem={(item, isHighlighted) =>
                    <ItemHolder key={item.id} className={isHighlighted ? "selected" : ""}>
                        {item.name}
                    </ItemHolder>
                }
                readOnly={readOnly}
                renderInput={props => <input readOnly={readOnly} {...props} />}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                onSelect={(val, item) => onChange(val, item)}
            />

            {currentAffiliation && currentAffiliation.ror_id ? <a href={currentAffiliation.ror_id} rel="noopener noreferrer" target="_blank"><img src={RorIcon} alt="ror icon" /></a> : null}
        </div>);
}

const AffiliationAutocomplete = styled(_AffiliationAutocomplete)`

  display: inline-block;
  vertical-align: middle;

  & input {
        font-family: ProximaNovaLight, sans-serif;
        font-size: 16px;
        color: black;
        ${BorderStyle}
  }
  
  & > div > div {
      z-index: 10000;
  }
`;


export default AffiliationAutocomplete;