import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import styled from 'styled-components';

import { Autocomplete, SmallAutocomplete } from './autocomplete';
import { th } from 'ds-awards-theme';

import { FaTimesCircle } from 'react-icons/fa';

const _getItemValue = (item) => item ? item.name : "";


const _AutocompleteEntity = ({className, entity, value, onChange, placeholder, readOnly, getItemValue=_getItemValue, renderInput, showRemoveButton=false,
                              removeEntity, modifyEntityForSelection=null, renderEntityValueRepresentation=null, autocompleteComponent=Autocomplete, ...rest}) => {

    const entityRender = useCallback(
        renderEntityValueRepresentation || ((entity) => <React.Fragment>{getItemValue(entity)}</React.Fragment>),
        [renderEntityValueRepresentation, getItemValue]
    );
    const [open, setOpen] = useState(false);
    const [focused, setFocused] = useState(false);
    const AutocompleteComponent = autocompleteComponent;

    const inputRender = renderInput || ((inputProps, ref, TextInputComponent) => {
        return (
            <div ref={ref}>
                <TextInputComponent placeholder={placeholder} readOnly={readOnly} {...inputProps} />
                <div className="remove-button-holder"><FaTimesCircle onClick={() => removeEntity(entity)} /></div>
                {entity ? <div className={`value-rep-holder`}><span>{entityRender(entity)}</span></div> : null}
            </div>
        );
    });

    const onSelect = useCallback(function(val, entity, input) {

        let modifiedEntity = entity ? (modifyEntityForSelection ? modifyEntityForSelection(entity) : entity) : null;

        if(onChange(val, modifiedEntity) && input) {
            // FIXME: may want to focus on the next form element (this is actually easier said than done - to do it correctly that is)
            input.blur();
        }

    }, [onChange, modifyEntityForSelection]);


    return (
        <div className={`${className} ${entity ? "has-entity" : ""} ${(open || focused) ? "open" : "closed"} ${showRemoveButton ? "remove-button" : ""}`}>
            <AutocompleteComponent value={value} onChange={onChange} onSelect={onSelect} getItemValue={getItemValue} onInputFocusChange={(f) => setFocused(f)}
                onMenuVisibilityChange={(f) => setOpen(f)} renderInput={inputRender}  {...rest} />
        </div>
    );
};


const AutocompleteEntity = styled(_AutocompleteEntity)`
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
    background: #ababab;    
    color: white;
    pointer-events: none;
    border-radius: 5px;
    
    font-family: ${th('autocomplete.entity.fontFamily')};
    font-size: ${th('autocomplete.entity.fontSize')};
        
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

export default AutocompleteEntity;


const _SmallAutocompleteEntity = (props) => {
    return <AutocompleteEntity autocompleteComponent={SmallAutocomplete} {...props} />
};

const SmallAutocompleteEntity = styled(_SmallAutocompleteEntity)`

  & .value-rep-holder {
    left: 4px;
  }
  
  & .value-rep-holder > span {
    max-width: calc(100% - 12px);
    padding: 2px 2px;
    border-radius: 3px;
    font-size: ${th('autocomplete.entity.small.fontSize')};
  }
`;


export { AutocompleteEntity, SmallAutocompleteEntity };

