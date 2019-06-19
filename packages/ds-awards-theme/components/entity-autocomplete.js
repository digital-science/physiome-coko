import React, { useState, useRef } from 'react';
import Autocomplete from 'react-autocomplete';
import styled from 'styled-components';

import useDebounce from '../hooks/useDebouncedValue'

import { BorderStyle, SmallBorderStyle } from "./bordered-element";
import { FaTimesCircle } from 'react-icons/fa';


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



const MenuItem = styled.div`
    padding: 5px 10px;
    font-size: 12px;
    background: white;
    cursor: pointer;
    color: #505050;
    
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


const DefaultGetItemValue = (item)=>item.name;

const DefaultRenderItem = (item, isHighlighted) => <MenuItem key={item.id} className={isHighlighted ? "selected" : ""}>{item.name}</MenuItem>;

const DefaultEntityRenderer = (entity) => <React.Fragment>{entity.name}</React.Fragment>;

const DefaultRenderMenu = function (items, value, style) {
    return <MenuHolder style={{ ...style, ...this.menuStyle }} children={items}/>;
};


function _EntityAutocomplete({className, readOnly, entity, value, placeholder, onChange, entityLookup, entityModifier,
                              showRemoveButton=false, removeEntity,
                              getItemValue=DefaultGetItemValue, renderItem=DefaultRenderItem, renderEntityValueRepresentation=DefaultEntityRenderer,
                              renderMenu=DefaultRenderMenu, maximumEntities=15, debounceInterval=250}) {

    const generationRef = useRef(0);
    const displayedGenerationRef = useRef(0);
    const [open, setOpen] = useState(false);
    const [focused, setFocused] = useState(false);
    const autocompleteRef = useRef(null);

    const [debouncedItems] = useDebounce(value, debounceInterval, (query, setter) => {

        ++generationRef.current;
        const generation = generationRef.current;

        entityLookup(query, maximumEntities).then(items => {

            if(generation > displayedGenerationRef.current) {
                displayedGenerationRef.current = generation;
                setter(items);
            }
        });
    }, []);

    const onSelect = function(val, entity) {

        let modifiedEntity = entity ? (entityModifier ? entityModifier(entity) : entity) : null;

        if(onChange(val, modifiedEntity)) {
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
        <div className={`${className} ${entity ? "has-entity" : ""} ${(open || focused) ? "open" : "closed"} ${showRemoveButton ? "remove-button" : ""}`}>
            <CustomisedAutocomplete
                ref={autocompleteRef}
                wrapperStyle={{}}

                renderInput={props => {
                    return (
                        <React.Fragment>
                            <input placeholder={placeholder} readOnly={readOnly} {...props} />
                            <div className="remove-button-holder"><FaTimesCircle onClick={() => removeEntity(entity)} /></div>
                            {entity ? <div className={`value-rep-holder`}><span>{renderEntityValueRepresentation(entity)}</span></div> : null}
                        </React.Fragment>
                    )
                }}

                renderMenu={renderMenu}

                renderItem={renderItem}
                items={debouncedItems}
                getItemValue={getItemValue}

                value={value}
                onChange={(e) => onChange(e.target.value)}
                onSelect={onSelect}

                readOnly={readOnly}

                open={open}
                onMenuVisibilityChange={(v) => { setOpen(v) }}
                onInputFocusChange={(f) => setFocused(f) }
            />
        </div>);
}

const EntityAutocomplete = styled(_EntityAutocomplete)`

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
  
  & input:focus {
    box-shadow: 0 0 1px 1px #2196F3;
    border-color: #2196F3;
    outline: 0;
  }
  
  & .remove-button-holder {
    display: none;
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
  
  &.closed.has-entity input {
    color: transparent;
  }
  
  
  &.closed.remove-button .remove-button-holder {
    display: flex;
    align-items: center;
    
    position: absolute;
    top: 0;
    bottom: 0;
    width: 24px;
    right: 0;
    
    border-left: 1px solid #d0d0d0;
    font-size: 15px;
  }
  
  &.closed.remove-button .remove-button-holder > svg {
     display: block;
     margin: auto;
     cursor: pointer;
     color: #d0d0d0;
  }
  
  &.closed.remove-button .remove-button-holder > svg:hover {
     color: #909090;
  }
  
  &.closed.remove-button input {
     padding-right: 24px;
  }

  &.closed.remove-button .value-rep-holder > span {
    max-width: calc(100% - 48px);
  }
`;


const ApplySmallAutocompleteStyle = (tag) => styled(tag)`

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

const SmallEntityAutocomplete = ApplySmallAutocompleteStyle(EntityAutocomplete);


export default EntityAutocomplete;

export { EntityAutocomplete, SmallEntityAutocomplete, MenuItem, MenuHolder, ApplySmallAutocompleteStyle };