import React, { useState, useRef, useEffect } from 'react';
import styled, { css } from 'styled-components';
import { BorderStyle, SmallBorderStyle } from './bordered-element';
import { th } from '../src/index';


const ORCIDInputStyle = css`
  display: block;
  vertical-align: middle;
  position: relative;
  font-family: ${th('input.fontFamily')};
  color: ${th('input.textColor')};
  
  & > input {
    box-sizing: border-box;
    border: none;
  }
  
  & > input:focus {
    outline: 0;
  }
  
  & > input::placeholder {
    color: ${th('input.placeholderTextColor')};
  }

  
  & > span {
    color: ${th('input.placeholderTextColor')};
  }
  
  & > span.sep {
    padding-right: 0.25em;
  }
  
  &.focused {
    box-shadow: 0 0 2px 2px #2196F3;
    border-color: #2196F3;
    outline: 0;
  }
`;


function ORCIDValueToPartValues(v) {

    const m = v ? ("" + v).match(/^([0-9]{4}-[0-9]{4}-[0-9]{4}-[0-9]{3}[0-9Xx])$/) : null;
    return m ? m[1].split("-") : ["", "", "", ""];
}


const _ORCIDInput = ({className, value, setValue, setValidationIssue}) => {

    const [isFocused, setIsFocused] = useState(false);
    const [didPaste, setDidPaste] = useState(false);
    const input1Ref = useRef(null);
    const input2Ref = useRef(null);
    const input3Ref = useRef(null);
    const input4Ref = useRef(null);
    const orderedInputs = [input1Ref, input2Ref, input3Ref, input4Ref];

    const [input1Value, setInput1Value] = useState(ORCIDValueToPartValues(value)[0]);
    const [input2Value, setInput2Value] = useState(ORCIDValueToPartValues(value)[1]);
    const [input3Value, setInput3Value] = useState(ORCIDValueToPartValues(value)[2]);
    const [input4Value, setInput4Value] = useState(ORCIDValueToPartValues(value)[3]);

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

    const onChangeInput1 = (event) => {
        const v = event.target.value.trim().replace(/[^0-9]/g, "").substring(0,4);
        setInput1Value(v);
        if(v.length === 4) {
            input2Ref.current.focus();
        }
        clearValidationIssues();
    };

    const onChangeInput2 = (event) => {
        const v = event.target.value.trim().replace(/[^0-9]/g, "").substring(0,4);
        setInput2Value(v);
        if(v.length === 4) {
            input3Ref.current.focus();
        }
        clearValidationIssues();
    };

    const onChangeInput3 = (event) => {
        const v = event.target.value.trim().replace(/[^0-9]/g, "").substring(0,4);
        setInput3Value(v);
        if(v.length === 4) {
            input4Ref.current.focus();
        }
        clearValidationIssues();
    };

    const onChangeInput4 = (event) => {
        const v = event.target.value;
        setInput4Value(v.toUpperCase().replace(/[^0-9X]/g, "").substring(0,4));
        clearValidationIssues();
    };

    useEffect(() => {

        if(input1Value && input2Value && input3Value && input4Value && input1Value.length === 4 && input2Value.length === 4
            && input3Value.length === 4 && input4Value.length === 4) {

            const newValue = `${input1Value}-${input2Value}-${input3Value}-${input4Value}`.toUpperCase();
            if(newValue !== value) {
                setValue(newValue);
                clearValidationIssues();
            }
        } else if(!input1Value && !input2Value && !input3Value && !input4Value) {

            if(value !== null) {
                setValue(null);
                clearValidationIssues();
            }
        }

    }, [input1Value, input2Value, input3Value, input4Value]);

    useEffect(() => {

        const parts = ORCIDValueToPartValues(value);

        if(input1Value !== parts[0]) {
            setInput1Value(parts[0]);
        }

        if(input2Value !== parts[1]) {
            setInput2Value(parts[1]);
        }

        if(input3Value !== parts[2]) {
            setInput3Value(parts[2]);
        }

        if(input4Value !== parts[3]) {
            setInput4Value(parts[3]);
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

        if(e.key === 'ArrowLeft' || e.key === 'ArrowRight') {

            const currentIndex = orderedInputs.map(v => v.current).indexOf(input);
            const prevInput = currentIndex > 0 ? orderedInputs[currentIndex - 1].current : null;
            const nextInput = currentIndex < (orderedInputs.length -1) ? orderedInputs[currentIndex + 1].current : null;

            if(e.key === 'ArrowLeft') {

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
        <div className={`${className} ${isFocused ? 'focused' : 'not-focused'}`} onClick={clickHandler}>
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