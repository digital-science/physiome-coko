import React, { useState, useMemo, useRef, useLayoutEffect } from 'react';
import { BorderedElement, SmallBorderedElement } from './bordered-element';
import styled, {css} from 'styled-components';
import { FaTimes } from 'react-icons/fa'
import { th } from '../src/index';

const ENTER_KEY = 13;
const COMMA_KEY = 188;
const BACKSPACE_KEY = 8;
const ESCAPE_KEY = 27;


const EditableTag = styled(({className, editing, value, removeTag, onChangeTag, onClick, onBlur, onFocus, didStopEditing}) => {

    const [text, setText] = useState(value);
    const inputRef = useRef();
    const spanRef = useRef();

    const onTextChange = (e) => {
        setText(e.target.value);
    };

    const inputOnFocus = () => {
        if(onFocus) {
            onFocus();
        }
    };

    const inputOnBlur = () => {
        setText(value);

        if(onBlur) {
            onBlur();
        }

        if(didStopEditing) {
            didStopEditing(false);
        }
    };

    const inputKeyUp = (e) => {
        if(e.keyCode === ESCAPE_KEY) {
            didStopEditing(false);
        } else if(e.keyCode === ENTER_KEY) {
            onChangeTag(text);
            didStopEditing(true);
        }
    };

    useLayoutEffect(() => {
        if(inputRef.current && spanRef.current) {
            const width = spanRef.current.getBoundingClientRect().width;
            inputRef.current.style.width = `${width + 1.0}px`;
        }
    }, [text]);

    useLayoutEffect(() => {
        if(editing && inputRef.current && document.activeElement !== inputRef.current) {
            inputRef.current.focus();
        }
    }, [editing]);

    const handlerProps = {
        onKeyUp:inputKeyUp,
        onChange: onTextChange,
        onFocus: inputOnFocus,
        onBlur: inputOnBlur
    };
    if(!editing) {
        handlerProps.onClick = onClick;
    }

    return (
        <li className={`${className} ${editing ? "editing" : ""}`}>
            <input ref={inputRef} type="text" value={text} readOnly={!editing} {...handlerProps} />
            <div onClick={removeTag}><FaTimes /></div>
            <span ref={spanRef}>{text}</span>
        </li>
    );
})`

   position: relative;
   
   & > input {
      padding: 3px 30px 3px 6px;
      padding-right: calc(6px + 6px + 6px + ${th('tagInput.fontSize')});
      border: 1px solid #909090;
      border-radius: 4px;
      color: black;
      outline: 0;
      box-sizing: content-box;
   }
   
   & > input[readonly] {
      border: 1px solid #909090;
      background: #ababab;
      color: white;
      outline: 0;
      cursor: pointer;
   }
   
   & > span {
    position: absolute;
    top: 0;
    left: 0;
    border: 1px solid transparent;
    visibility: hidden;
    white-space: pre;
    box-sizing: content-box;
   }
   
   & > div {
    position: absolute;
    right: 0;
    top: 0;
    bottom: 0;
    color: white;
    
    display: flex;
    align-items: center;
    justify-content: center;
    
    padding-right: 6px;
    padding-left: 6px;
    border-left: 1px solid #909090;
    
    font-size: ${th('tagInput.fontSize')};
    cursor: pointer;
    border-top-right-radius: 4px;
    border-bottom-right-radius: 4px;
   }
   
   & > div:hover {
      background: #909090;
   }
   
   &.editing > div {
    /*visibility: hidden;*/
    opacity: 0.5;
    background: #ababab;
   }
`;




const _TagEditor = styled(({className, value, placeholder=null, onChange}) => {

    const [hasFocus, setHasFocus] = useState(false);
    const [text, setText] = useState("");
    const [editing, setEditing] = useState(null);
    const inputRef = useRef();
    const spanRef = useRef();

    const tags = useMemo(() => {
        setEditing(null);
        return (value || []).map(v => {return {tag: v}});
    }, [value]);

    const onChangeTag = (t, text) => {
        t.tag = text;
        const v = tags.map(t => t.tag).filter(t => !!t);
        onChange(v);
    };

    const removeTag = (rm) => {
        const v = tags.filter(t => t !== rm).map(t => t.tag).filter(t => !!t);
        onChange(v);

        setEditing(null);
        if(inputRef.current) {
            inputRef.current.focus();
        }
    };

    const onTextChange = (e) => {
        setText(e.target.value || "");
    };

    const inputKeyUp = (e) => {
        if(e.keyCode === ENTER_KEY || e.keyCode === COMMA_KEY) {
            if(text) {
                const t = tags.map(t => t.tag).filter(t => !!t);
                onChange([...t, text]);
                setText("");
                e.stopPropagation();
            }
        }
    };

    const inputKeyDown = (e) => {
        if (e.keyCode === BACKSPACE_KEY && !text && tags.length) {
            setEditing(tags[tags.length-1]);
            e.preventDefault();
        }
    };

    const onClickTag = (tag) => {
        if(tag !== editing) {
            setEditing(tag);
        }
    };

    const didStopEditingTag = (tag, changed) => {
        if(tag === editing) {
            setEditing(null);
            if(changed && inputRef.current) {
                inputRef.current.focus();
            }
        }
    };

    const onTagInputFocus = (tag) => {
        setHasFocus(true);
        if(tag !== editing) {
            setEditing(tag);
        }
    };

    const onInputFocus = () => {
        setHasFocus(true);
    };

    const onInputBlur = () => {
        setHasFocus(false);
    };

    const onClickBackground = (e) => {
        if(e.target && e.target instanceof HTMLInputElement) {
            return;
        }

        if(inputRef.current) {
            inputRef.current.focus();
        }
    };

    useLayoutEffect(() => {
        if(inputRef.current && spanRef.current) {
            const width = spanRef.current.getBoundingClientRect().width;
            inputRef.current.style.width = `${width + 2}px`;
        }
    }, [text]);

    return (
        <div className={`${className} ${hasFocus ? "focus" : ""}`} onClick={onClickBackground}>
            <ol>
                {tags.map((t, i) => (
                    <EditableTag key={t.tag + i} value={t.tag} editing={t === editing} removeTag={() => removeTag(t)}
                        onClick={() => onClickTag(t)} onFocus={() => onTagInputFocus(t)} onBlur={onInputBlur}
                        onChangeTag={text => onChangeTag(t, text)}
                        didStopEditing={(changed) => didStopEditingTag(t, changed)}>
                        {t.tag}
                    </EditableTag>
                ))}
            </ol>
            <input ref={inputRef} type="text" placeholder={placeholder} value={text} onFocus={onInputFocus} onBlur={onInputBlur}
                onChange={onTextChange} onKeyUp={inputKeyUp} onKeyDown={inputKeyDown} />
            <span ref={spanRef}>{text || placeholder || ""}</span>
        </div>
    );
})`

  position: relative;
  font-family: ${th('tagInput.fontFamily')};
  font-size: ${th('tagInput.fontSize')};
  box-sizing: content-box;
  padding: 6px !important;
  padding-bottom: 1px !important;
    
  &.focus {
    box-shadow: 0 0 2px 2px #2196F3;
    border-color: #2196F3;
  }
  
  & ol {
    display: inline;
    list-style: none;
    margin: 0;
    padding: 0;
  }
  
  & ol:after {
    content: " "
  }
  
  & ol li {
    display: inline-block;
    margin-bottom: 5px;
    margin-right: 6px;
  }
  
  & > input {
    min-width: 20px;
    border: 1px solid transparent;
    margin-bottom: 5px;
    margin-right: 6px;
    padding: 3px;
  }
  & > input:focus {
    outline: 0;
  }
  & > span {
    visibility: hidden;
    position: absolute;
    top: 0;
    left: 0;
    white-space: pre;
  }

`;

const _SmallTagEditor = styled(_TagEditor)`
  
`;


const TagEditor = BorderedElement(_TagEditor);
const SmallTagEditor = SmallBorderedElement(_SmallTagEditor);

export default TagEditor;

export { TagEditor, SmallTagEditor };


