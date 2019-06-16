import React, { useState, useRef } from 'react';
import Autocomplete from 'react-autocomplete';
import styled from 'styled-components';

import useDebounce from '../hooks/useDebouncedValue'

import { BorderStyle, SmallBorderStyle } from "ds-awards-theme/components/bordered-element";

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

    handleInputFocus() {
        super.handleInputFocus();

        if(this.isInputFocused() && this.props.onInputFocusChange) {
            this.props.onInputFocusChange(true);
        }
    }

    handleInputBlur() {
        super.handleInputBlur();

        if(!this.isInputFocused() && this.props.onInputFocusChange) {
            this.props.onInputFocusChange(false);
        }
    }
}


function lookupAffiliations(value) {

    if(!value || !value.length) {
        return Promise.resolve([]);
    }

    const qp = {};

    qp.page = "1";
    //qp.qp = "multiMatch";
    qp.query = encodeURIComponent(value);

    const q = Object.keys(qp).map(k => `${k}=${qp[k]}`).join("&");
    const url = `https://api.ror.org/organizations?${q}`;

    return fetch(url).then(function(response) {
        return response.json();
    }).then(function(r) {
        return (r.items || []).slice(0, 14);
    });
}


const ItemHolder = styled.div`
    padding: 5px 10px;
    font-size: 12px;
    background: white;
    cursor: pointer;
    
    &.selected {
      background: #b3e7ff;
    }
`;

const MenuHolder = styled.div`
    position: fixed;
    overflow: auto;
    max-height: 50%;
    box-shadow: rgba(0, 0, 0, 0.1) 0 2px 12px;
    background: rgba(255, 255, 255, 0.9);
    
    border: 1px solid #d0d0d0;
    border-radius: 6px;
    padding: 0;
    margin-top: 2px;
    z-index: 10000;
`;



function _OrganisationAutocomplete({className, readOnly, value, placeholder, onChange, organisationEntity}) {

    const generationRef = useRef(0);
    const displayedGenerationRef = useRef(0);
    const [open, setOpen] = useState(false);
    const [focused, setFocused] = useState(false);
    const autocompleteRef = useRef(null);

    const [debouncedItems] = useDebounce(value, 250, (query, setter) => {

        ++generationRef.current;
        const generation = generationRef.current;

        lookupAffiliations(query).then(items => {

            if(generation > displayedGenerationRef.current) {
                displayedGenerationRef.current = generation;
                setter(items);
            }
        });
    }, []);

    const onSelect = function(val, item) {

        if(onChange(val, item)) {
            const autcomplete = autocompleteRef.current;
            if(autcomplete) {

                const input = autcomplete.refs.input;
                if(input) {
                    input.blur();
                }
            }
        }
    };

    return (
        <div className={`${className} ${organisationEntity ? "has-org" : ""} ${(open || focused) ? "open" : "closed"}`}>
            <CustomisedAutocomplete
                ref={autocompleteRef}
                wrapperStyle={{}}

                getItemValue={(item) => item.name}
                items={debouncedItems}
                renderItem={(item, isHighlighted) =>
                    <ItemHolder key={item.id} className={isHighlighted ? "selected" : ""}>
                        {item.name}
                    </ItemHolder>
                }

                open={open}
                onMenuVisibilityChange={(v) => { setOpen(v) }}
                onInputFocusChange={(f) => setFocused(f) }

                renderInput={props => {
                    return (
                        <React.Fragment>
                            <input placeholder={placeholder} readOnly={readOnly} {...props} />
                            {organisationEntity ?
                                <div className={`value-rep-holder`}>
                                    <span>
                                        {organisationEntity.name}
                                        {organisationEntity.country && organisationEntity.country.country_code ? <span className="cc">{organisationEntity.country.country_code}</span> : null}
                                    </span>
                                </div>
                                : null}
                        </React.Fragment>
                    )
                }}

                renderMenu={function (items, value, style) {
                    return <MenuHolder style={{ ...style, ...this.menuStyle }} children={items}/>;
                }}

                value={value}
                onChange={(e) => onChange(e.target.value)}
                onSelect={onSelect}

                readOnly={readOnly}
            />

            {organisationEntity && organisationEntity.ror_id ? <a href={currentAffiliation.ror_id} rel="noopener noreferrer" target="_blank"><img src={RorIcon} alt="ror icon" /></a> : null}
        </div>);
}

const OrganisationAutocomplete = styled(_OrganisationAutocomplete)`

  display: block;
  vertical-align: middle;
  position: relative;
  font-family: ProximaNovaLight, sans-serif;

  & input {
    width: 100%;
    box-sizing: border-box;

    font-size: 16px;
    color: black;
    ${BorderStyle}
  }
    
  & .value-rep-holder {
    position: absolute;
    display: flex;
    align-items: center;

    top: 0;
    left: 5px;
    bottom: 0;
    right: 0;
    
    pointer-events: none;
  }
  
  & .value-rep-holder > span {
  
    display: inline-block;
    max-width: calc(100% - 24px);
    padding: 3px 7px;
    border: 1px solid #909090;
    background: #ababab;    color: white;
    pointer-events: none;
    border-radius: 5px;
    
    font-size: 16px;
    
    max-height: 1.15em;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  
  & .value-rep-holder > span .cc {
    font-style: italic;
  }
  & .value-rep-holder > span .cc:before {
    content: " (";
  }
  & .value-rep-holder > span .cc:after {
    content: ")";
  }
  
  &.open .value-rep-holder {
    display: none;
  }
  
  &.closed.has-org input {
    color: transparent;
  }
`;

const SmallOrganisationAutocomplete = styled(OrganisationAutocomplete)`
  & input {
      font-size: 12px;
      ${SmallBorderStyle}
  }
  
  & .value-rep-holder {
    left: 4px;
  }
  
  & .value-rep-holder > span {
    max-width: calc(100% - 12px);
    padding: 2px 2px;
    border-radius: 3px;
    font-size: 12px;
  }
`;


export default OrganisationAutocomplete;

export { SmallOrganisationAutocomplete };