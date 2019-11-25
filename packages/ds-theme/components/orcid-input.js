import React, { useState, useRef, useEffect, useMemo } from 'react';
import styled, { css } from 'styled-components';
import { BorderStyle, SmallBorderStyle, IssueBorderStyle } from './bordered-element';
import { th } from '../src/index';


const ORCIDInputStyle = css`
  display: block;
  vertical-align: middle;
  position: relative;
  font-family: ${th('input.fontFamily')};
  color: ${th('input.textColor')};
  cursor: text;
  padding-left: 24px;

  & > input {
    box-sizing: border-box;
    border: none;
  }
  
  & > img {
    position: absolute;
    left: 6px;
    opacity: 0.5;
  }
  
  &.valid-orcid > img {
     opacity: 1.0;
  }
  
  & > input:focus {
    outline: 0;
  }
  
  & > input::placeholder {
    color: ${th('input.placeholderTextColor')};
  }

  
  & > span {
    color: ${th('input.placeholderTextColor')};
    user-select: none;
    cursor: text;
  }
  
  & > span.sep {
    padding-right: 0.25em;
  }
  
  &.focused {
    box-shadow: 0 0 2px 2px #2196F3;
    border-color: #2196F3;
    outline: 0;
  }
  
  &.issues {
    ${IssueBorderStyle}
  }
`;


function ORCIDValueToPartValues(v, exactMatch=false) {

    if(exactMatch) {
        const m = v ? ("" + v).toUpperCase().match(/^([0-9]{4}-[0-9]{4}-[0-9]{4}-[0-9]{3}[0-9X])$/) : null;
        return m ? m[1].split("-") : ["", "", "", ""];
    }

    const p = [...(v || "").split("-"), "", "", "", ""];
    return p.map((p, index) => ('' + p).toUpperCase().replace(index === 3 ? /[^0-9X]/g : /[^0-9]/g, "").substring(0,4)).slice(0, 4);
}


function _createInputChangeHandler(setValue, nextInputRef, clearValidationIssues) {

    return (event) => {
        const v = event.target.value.trim().replace(/[^0-9]/g, "").substring(0,4);
        setValue(v);

        if(nextInputRef && v.length === 4 && event.target.selectionEnd === 4) {
            const nextInput = nextInputRef.current;
            nextInput.focus();
            if(nextInput.value.length) {
                nextInput.setSelectionRange(0, nextInput.value.length);
            }
        }

        clearValidationIssues();
    };
}

const _ORCIDInput = ({className, value, setValue, validValue = false, validationIssue, setValidationIssue}) => {

    // Note: value/setValue are used when a complete ORCID identifier is detected (or all values removed from component inputs).
    // The intermediate values updates and returns what values are currently held in each component input. The client of the component
    // can then utilise this value to respond to validation attempts etc.

    const valueParts = useMemo(() => ORCIDValueToPartValues(value) , [value]);

    const [isFocused, setIsFocused] = useState(false);
    const [didPaste, setDidPaste] = useState(false);
    const input1Ref = useRef(null);
    const input2Ref = useRef(null);
    const input3Ref = useRef(null);
    const input4Ref = useRef(null);
    const orderedInputs = [input1Ref, input2Ref, input3Ref, input4Ref];

    const [input1Value, setInput1Value] = useState(valueParts[0]);
    const [input2Value, setInput2Value] = useState(valueParts[1]);
    const [input3Value, setInput3Value] = useState(valueParts[2]);
    const [input4Value, setInput4Value] = useState(valueParts[3]);
    const orderedInputValues = [input1Value, input2Value, input3Value, input4Value];
    const orderedSetInputValues = [setInput1Value, setInput2Value, setInput3Value, setInput4Value];

    const clearValidationIssues = () => {
        if(setValidationIssue) {
            setValidationIssue(false);
        }
    };

    const focusedInput = () => {
        if(document.hasFocus()) {
            setIsFocused(true);
        }
    };

    const blurInput = () => {
        const currentElement = document.activeElement;

        if(!currentElement || !document.hasFocus()) {
            setIsFocused(false);
            return;
        }

        if(input1Ref.current !== currentElement && input2Ref.current !== currentElement && input3Ref.current !== currentElement && input4Ref.current !== currentElement) {
            setIsFocused(false);
        }
    };

    const clickHandler = (e) => {
        const eventTarget = e.target;
        if(input1Ref.current !== eventTarget && input2Ref.current !== eventTarget && input3Ref.current !== eventTarget && input4Ref.current !== eventTarget) {
            input1Ref.current.focus();
        }
    };

    const onChangeInput1 = _createInputChangeHandler(setInput1Value, input2Ref, clearValidationIssues);
    const onChangeInput2 = _createInputChangeHandler(setInput2Value, input3Ref, clearValidationIssues);
    const onChangeInput3 = _createInputChangeHandler(setInput3Value, input4Ref, clearValidationIssues);
    const onChangeInput4 = (event) => {
        const v = event.target.value;
        setInput4Value(v.toUpperCase().replace(/[^0-9X]/g, "").substring(0,4));
        clearValidationIssues();
    };

    useEffect(() => {

        if(input1Value || input2Value || input3Value || input4Value) {
            const newValue = `${input1Value}-${input2Value}-${input3Value}-${input4Value}`.toUpperCase();
            if(newValue !== value) {
                setValue(newValue);
                clearValidationIssues();
            }
        } else {
            if(value !== null) {
                setValue(null);
                clearValidationIssues();
            }
        }

    }, [input1Value, input2Value, input3Value, input4Value]);

    useEffect(() => {

        //const parts = ORCIDValueToPartValues(value);

        if(input1Value !== valueParts[0]) {
            setInput1Value(valueParts[0]);
        }

        if(input2Value !== valueParts[1]) {
            setInput2Value(valueParts[1]);
        }

        if(input3Value !== valueParts[2]) {
            setInput3Value(valueParts[2]);
        }

        if(input4Value !== valueParts[3]) {
            setInput4Value(valueParts[3]);
        }

        if(didPaste) {

            const lastInput = input4Ref.current;
            lastInput.focus();
            lastInput.setSelectionRange(lastInput.value.length, lastInput.value.length);

            setDidPaste(false);
        }

    }, [value, didPaste]);


    const onInputPaste = (e) => {

        if(typeof e.clipboardData !== 'undefined' && typeof e.clipboardData.getData !== "undefined") {

            const pastedValue = e.clipboardData.getData('Text');
            if(pastedValue) {
                const m = pastedValue.trim().match(/^(https?:\/\/orcid.org\/)?([0-9]{4}-[0-9]{4}-[0-9]{4}-[0-9]{3}[0-9Xx])\/?$/);
                if(m && m[2]) {

                    const newValue = m[2].toUpperCase();
                    if(value !== newValue) {
                        setValue(newValue);
                        setDidPaste(true);
                        clearValidationIssues();
                    }

                    e.preventDefault();
                }
            }
        }
    };

    const onKeyDown = (e) => {

        const input = e.target;

        if(e.key === 'ArrowLeft' || e.key === 'ArrowRight' || e.key === 'Backspace') {

            const currentIndex = orderedInputs.map(v => v.current).indexOf(input);
            const prevInput = currentIndex > 0 ? orderedInputs[currentIndex - 1].current : null;
            const nextInput = currentIndex < (orderedInputs.length -1) ? orderedInputs[currentIndex + 1].current : null;

            if(e.key === 'Backspace') {

                if(prevInput && input.selectionStart === input.selectionEnd && input.selectionStart === 0) {

                    const prevInputValue = orderedInputValues[currentIndex - 1];
                    const prevInputSetValue = orderedSetInputValues[currentIndex - 1];


                    let newPrevInputValue = (prevInputValue || "");
                    if(newPrevInputValue.length) {
                        newPrevInputValue = newPrevInputValue.substr(0,newPrevInputValue.length - 1);
                    }
                    prevInputSetValue(newPrevInputValue);

                    prevInput.focus();
                    prevInput.setSelectionRange(newPrevInputValue.length, newPrevInputValue.length);
                    e.preventDefault();
                }

            } else if(e.key === 'ArrowLeft') {

                if(prevInput && input.selectionStart === input.selectionEnd && input.selectionStart === 0) {
                    prevInput.focus();
                    prevInput.setSelectionRange(prevInput.value.length, prevInput.value.length);
                    e.preventDefault();
                }

            } else {

                if(nextInput && input.selectionStart === input.selectionEnd && input.selectionStart === input.value.length) {
                    nextInput.focus();
                    nextInput.setSelectionRange(0, 0);
                    e.preventDefault();
                }
            }
        }
    };

    return (
        <div className={`${className} ${isFocused ? 'focused' : 'not-focused'} ${validValue ? 'valid-orcid' : ''} ${validationIssue ? 'issues' : ''}`} onClick={clickHandler}>
            <img alt="ORCID logo" src="https://orcid.org/sites/default/files/images/orcid_16x16.png" width="14" height="14" />
            <span>https://orcid.org/&nbsp;</span>
            <input type="text" value={input1Value} onChange={onChangeInput1} placeholder={'XXXX'} size="4" minLength="4" maxLength="4" ref={input1Ref} onFocus={() => focusedInput(input1Ref.current)} onBlur={blurInput} onKeyDown={onKeyDown} onPaste={onInputPaste} />
            <span className="sep">-</span>
            <input type="text" value={input2Value} onChange={onChangeInput2} placeholder={'XXXX'} size="4" minLength="4" maxLength="4" ref={input2Ref} onFocus={() => focusedInput(input2Ref.current)} onBlur={blurInput} onKeyDown={onKeyDown} onPaste={onInputPaste} />
            <span className="sep">-</span>
            <input type="text" value={input3Value} onChange={onChangeInput3} placeholder={'XXXX'} size="4" minLength="4" maxLength="4"ref={input3Ref} onFocus={() => focusedInput(input3Ref.current)} onBlur={blurInput} onKeyDown={onKeyDown} onPaste={onInputPaste} />
            <span className="sep">-</span>
            <input type="text" value={input4Value} onChange={onChangeInput4} placeholder={'XXXX'} size="4" minLength="4" maxLength="4" ref={input4Ref} onFocus={() => focusedInput(input4Ref.current)} onBlur={blurInput} onKeyDown={onKeyDown} onPaste={onInputPaste} />
        </div>
    );
};

const ORCIDInput = styled(_ORCIDInput)`
  ${BorderStyle}
  ${ORCIDInputStyle}
  font-size: ${th('textInput.default.fontSize')};
  
  & > input {
    font-size: ${th('textInput.default.fontSize')};
  }
`;

const SmallORCIDInput = styled(_ORCIDInput)`
  ${SmallBorderStyle}
  ${ORCIDInputStyle}
  font-size: ${th('textInput.small.fontSize')};
    
  & > input {
    font-size: ${th('textInput.small.fontSize')};
  }
`;


export default ORCIDInput;
export { ORCIDInput, SmallORCIDInput };




function isValidORCIDValue(value) {
    return value ? !!(("" + value).toUpperCase().match(/^([0-9]{4}-[0-9]{4}-[0-9]{4}-[0-9]{3}[0-9X])$/)) : false;
}

function checkORCIDChecksum(value) {

    const m = value ? ("" + value).toUpperCase().match(/^([0-9]{4}-[0-9]{4}-[0-9]{4}-[0-9]{3}[0-9X])$/) : null;
    if(!m) {
        return false;
    }

    const simpleValue = m[1].replace(/-/g, "");
    if(simpleValue.length !== 16) {
        return false;
    }

    let total = 0;
    for(let i = 0; i < 15; i++) {
        const c = simpleValue[i];
        total = (total + (c - "0")) * 2;
    }

    const remainder = total % 11;
    const result = (12 - remainder) % 11;
    const checksum = result === 10 ? "X" : result.toString();

    return simpleValue.toUpperCase()[15] === checksum;
}


export { isValidORCIDValue, checkORCIDChecksum };
