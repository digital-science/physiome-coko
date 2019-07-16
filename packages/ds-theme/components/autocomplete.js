import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import styled from 'styled-components';

import { TextInput, SmallTextInput } from './text-input';
import Spinner from './spinner';

import TooltipTrigger from 'react-popper-tooltip';
import 'react-popper-tooltip/dist/styles.css';

import useDebounce from '../hooks/useDebouncedValue';

import { th } from 'ds-theme';


const TooltipHolder = styled.div`
  &.tooltip-container {
    margin-left: 0;
    margin-right: 0;
    padding: 0;
  }
`;


function findParentNodeWithClass(node, className) {

    let currentNode = node.parentElement;

    while(currentNode) {
        if(currentNode.classList && currentNode.classList.length) {
            if([...currentNode.classList].indexOf(className) !== -1) {
                return currentNode;
            }
        }
        currentNode = currentNode.parentElement;
    }

    return null;
}



const _MenuHolder = ({className, holderRef, children}) => {

    // Holder reference is the autocomplete div holding the displayed user input.
    const extraStyle = {};
    if(holderRef.current) {
        extraStyle.minWidth = holderRef.current.offsetWidth + 'px';

        const contentParent = findParentNodeWithClass(holderRef.current, "content");

        if(contentParent && contentParent.offsetWidth) {
            extraStyle.maxWidth = contentParent.offsetWidth + 'px';
        } else {
            extraStyle.maxWidth = holderRef.current.offsetWidth + 'px';
        }
    }

    return (
        <div className={className} style={extraStyle}>
            {children}
        </div>
    );
};

const MenuHolder = styled(_MenuHolder)`
`;


const MenuItem = styled.div`
  font-family: ${th('autocomplete.item.fontFamily')};
  font-size: ${th('autocomplete.item.fontSize')};
  padding: 0.4rem;
  cursor: pointer;

  &.selected {
    background: #cde9ff;
  }
`;

const SmallMenuItem = styled(MenuItem)`
 & {
   font-size: ${th('autocomplete.item.small.fontSize')};
 }
`;

const MenuHeader = styled.div`
  padding: 0.4rem;
`;

const MenuFooter = styled.div`
  padding: 0.4rem;
`;



function _holderRefToInput(holderRef) {
    if(!holderRef.current) {
        return null;
    }
    const inputs = holderRef.current.getElementsByTagName('input');
    return (inputs && inputs.length) ? inputs[0] : null;
}


function _getItemValue(item) {
    return item;
}

function noop() {
}


const _Autocomplete = ({className, ref, value, onChange, onSelect,
                        onInputFocusChange=noop, onAutocompleteVisibilityChange=noop,
                        lookupItems, getItemValue=_getItemValue, debounceInterval=250,
                        textInputComponent=TextInput, menuItemComponent=MenuItem, menuHolderComponent=MenuHolder,
                        renderInput, renderMenu, renderMenuHeader, renderMenuItem, renderMenuFooter}) => {

    const [showing, setShowing] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        onAutocompleteVisibilityChange(showing);
    }, [showing]);


    const [selectedIndex, setSelectedIndex] = useState(0);
    const [renderedItems, setRenderedItems] = useState(null);
    const [ignoreBlur, setIgnoreBlur] = useState(false);
    const holderRef = React.useRef();

    const displayedGenerationRef = useRef(0);
    const generationRef = useRef(0);

    const [debouncedValue] = useDebounce(value, debounceInterval, null, value);
    const [debouncedItems, setDebouncedItems] = useState(null);
    const debouncedItemsValuesRef = useRef(null);
    const currentQueryValuesRef = useRef(null);
    const pendingQueryInstancesRef = useRef([]);


    const loadQuery = useCallback((query) => {

        // If the new debounced values is the same as the debounced items source value (and no other lookup operation is underway)
        // then we can do nothing.
        if(debouncedItemsValuesRef.current === query && displayedGenerationRef.current === generationRef.current) {
            return;
        }

        // If the currently pending query is the same as the provided query and the query generation exceeds the displayed
        // query generation then we are already awaiting the results of the exact same query.
        if(currentQueryValuesRef.current === query && generationRef.current > displayedGenerationRef.current) {
            return;
        }

        // Increment the current generation and indicate that a loading operation is underway.
        ++generationRef.current;
        const generation = generationRef.current;

        setLoading(true);
        currentQueryValuesRef.current = query;

        // Create a new query "instance" with the results and finally handlers defined.
        const instance = {};
        instance.query = query;
        instance.resultsHandler = (items) => {

            // If our current generation exceeds the displayed generation, then go ahead and display the items.
            // We also update the debounced items value reference to the original query value that began
            // the item lookup.

            if(generation > displayedGenerationRef.current) {
                displayedGenerationRef.current = generation;
                debouncedItemsValuesRef.current = query;
                setDebouncedItems(items);
            }
        };

        instance.finally = () => {

            // If the most recent generation and displayed generation are the same, then no loading operation
            // is currently pending.

            if(generationRef.current === displayedGenerationRef.current) {
                setLoading(false);
                currentQueryValuesRef.current = null;
            }

            pendingQueryInstancesRef.current = pendingQueryInstancesRef.current.filter(v => v !== instance);
        };

        pendingQueryInstancesRef.current.push(instance);


        lookupItems(query).then(items => {
            if(instance.resultsHandler) {
                instance.resultsHandler(items);
            }
        }).finally(() => {
            if(instance.finally) {
                instance.finally();
            }
        });

    }, [generationRef, setLoading, displayedGenerationRef, debouncedItemsValuesRef, setDebouncedItems]);


    // Cleanup any pending queries that happen to be executing when the component gets destroyed.
    useEffect(() => {

        return () => {
            pendingQueryInstancesRef.current.forEach(pendingQuery => {
                pendingQuery.resultsHandler = null;
                pendingQuery.finally = null;
            });
            pendingQueryInstancesRef.current = [];
        };

    }, [pendingQueryInstancesRef]);


    // When an item is selected, we pre-emptively perform a query for that specific value so we can quickly show
    // the item listing when it is re-selected (if the value and lookup value match nothing will happen).

    const select = useCallback((item, value) => {
        if(onSelect) {
            onSelect(value, item, _holderRefToInput(holderRef));
        } else {
            onChange(value, item, _holderRefToInput(holderRef));
        }
        return loadQuery(value);
    }, [onSelect, onChange, holderRef]);


    useEffect(() => {

        if(!showing) {
            return;
        }
        loadQuery(value);

    }, [showing, loadQuery]);

    useEffect(() => {

        // Only need to lookup values when the autocomplete overlay is showing.
        if(!showing) {
            return;
        }
        loadQuery(debouncedValue);

    }, [showing, loadQuery, debouncedValue]);



    // Menu item render, will redraw when either the displayed debounced items or the selected item changes. Also handles
    // the mouse entering an item (changes the currently selected index) also handles the user clicking on an item.

    const itemRender = renderMenuItem || (({item, index, isSelected}, MenuItemComponent) => {
        return <MenuItemComponent className={isSelected ? 'selected' : ''} key={index}>{getItemValue(item)}</MenuItemComponent>;
    });

    useEffect(() => {

        const newRenderedItems = (debouncedItems && debouncedItems.length) ? debouncedItems.map((item, index) => {

            const renderedItem = itemRender({item, index, isSelected:(selectedIndex === index)}, menuItemComponent);
            if(!renderedItem) {
                return null;
            }

            return React.cloneElement(renderedItem, {
                onMouseEnter: () => {
                    if(selectedIndex !== index) {
                        setSelectedIndex(index);
                    }
                },
                onClick: () => {
                    select(item, getItemValue(item));
                    setSelectedIndex(index);
                    setShowing(false);
                    setIgnoreBlur(false);
                },
            });

        }) : null;

        setRenderedItems(newRenderedItems);

    }, [
        debouncedItems, selectedIndex, setSelectedIndex, setShowing, setIgnoreBlur, setRenderedItems, select,
        itemRender, menuItemComponent
    ]);


    const menuHeaderRender = renderMenuHeader || ((loading) => null);
    const menuFooterRender = renderMenuFooter || ((loading) => loading ? <MenuFooter><Spinner message="Loading…" small={true} /></MenuFooter> : null);

    // Menu render, default is to wrap inside the autocomplete tooltip holder and then render
    // each of the menu items. The rendered menu items are cached above.

    const menuRender = renderMenu || ((items, loading, holderRef, MenuHolderComponent) => {
        return (
            <MenuHolderComponent className="content" holderRef={holderRef}>
                {menuHeaderRender(loading)}
                {items || null}
                {menuFooterRender(loading)}
            </MenuHolderComponent>
        );
    });



    // Tooltip render. Call the menu render method with the rendered items and loading indicator. The menu is then
    // cloned to include the additional ignore blur methods that prevent the menu from being hidden (due to blur
    // initiated by the text input blurring on click events).

    const tooltip = ({tooltipRef, getTooltipProps}) => {

        const menu = menuRender(renderedItems, loading, holderRef, menuHolderComponent);
        const clonedMenu = menu ? React.cloneElement(<div>{menu}</div>, {
            onMouseEnter: () => {
                setIgnoreBlur(true);
            },
            onTouchStart: () => {
                setIgnoreBlur(true);
            },
            onMouseLeave: () => {
                setIgnoreBlur(false);
            }
        }) : null;

        return (
            <TooltipHolder {...getTooltipProps({ref: tooltipRef, className: `tooltip-container ${loading ? 'tooltip-loading' : ''}`})}>
                {clonedMenu}
            </TooltipHolder>
        );
    };

    const visibilityChanged = (tooltipShown) => {
        setShowing(tooltipShown);
    };


    const inputProps = useMemo(() => {

        const onTextClick = () => {
            const input = _holderRefToInput(holderRef);
            if(input && input.ownerDocument && input === input.ownerDocument.activeElement && !showing) {
                setShowing(true);
            }
        };

        const onTextFocus = () => {
            setShowing(true);
            onInputFocusChange(true);
        };

        const onTextBlur = () => {
            if(!ignoreBlur) {
                setShowing(false);
            }
            onInputFocusChange(false);
        };

        const keydownHandler = {
            ArrowDown: (event) => {
                event.preventDefault();

                if(!debouncedItems) {
                    return;
                }
                const length = debouncedItems.length;
                if(!length) {
                    return;
                }

                if(!showing) {
                    setShowing(true);
                    if(selectedIndex === null) {
                        setSelectedIndex(0);
                    }
                } else {
                    setSelectedIndex(selectedIndex + 1 >= length ? 0 : selectedIndex + 1);
                }
            },

            ArrowUp: (event) => {
                event.preventDefault();

                if(!debouncedItems) {
                    return;
                }
                const length = debouncedItems.length;
                if(!length) {
                    return;
                }

                if(!showing) {
                    setShowing(true);
                    if(selectedIndex === null) {
                        setSelectedIndex(0);
                    }
                } else {
                    setSelectedIndex(selectedIndex - 1 >= 0 ? selectedIndex - 1 : length - 1);
                }
            },

            Escape: (event) => {

                const input = _holderRefToInput(holderRef);
                if(input && input.ownerDocument && input === input.ownerDocument.activeElement && !showing) {
                    event.preventDefault();
                    setIgnoreBlur(false);
                    input.blur();
                    return;
                }

                event.preventDefault();
                setIgnoreBlur(false);
                setShowing(false);
            },

            Enter: (event) => {
                if (event.keyCode !== 13)  {
                    return;
                }

                setIgnoreBlur(false);
                if(!showing) {
                    return;
                }

                if(!holderRef.current) {
                    return;
                }

                const inputs = holderRef.current.getElementsByTagName('input');
                if(!inputs || !inputs.length) {
                    return;
                }
                const input = inputs[0];

                if(selectedIndex === null) {
                    input.select();
                    setShowing(false);
                    return;
                }

                const item = debouncedItems[selectedIndex];
                const itemValue = getItemValue(item);

                event.preventDefault();
                input.setSelectionRange(itemValue.length, itemValue.length);

                select(item, itemValue);
                setShowing(false);
            },

            Tab: () => {
                setIgnoreBlur(false);
            }
        };

        const onTextKeyDown = (e) => {
            if(keydownHandler[e.key]) {
                keydownHandler[e.key](e);
            }
        };

        const onTextChange = (e) => {
            if(value !== e.target.value && !showing) {
                setShowing(true);
            }
            onChange(e.target.value);
        };

        return {
            role: 'combobox',
            'aria-autocomplete': 'list',
            'aria-expanded': showing,
            autoComplete: 'off',
            value,
            onChange:onTextChange,
            onClick:onTextClick,
            onBlur:onTextBlur,
            onFocus:onTextFocus,
            onKeyDown:onTextKeyDown
        };

    }, [
        value, onChange, select, debouncedItems, holderRef,
        showing, setShowing, selectedIndex, setSelectedIndex, ignoreBlur, setIgnoreBlur
    ]);


    const inputRender = renderInput || ((inputProps, ref, TextInputComponent) => {
        return (
            <div ref={ref}>
                <TextInputComponent {...inputProps} />
            </div>
        );
    });

    const modifiers = {
        flip: {
            enabled: false
        },
        preventOverflow: {
            escapeWithReference: true
        }
    };

    return (
        <div className={className} ref={ref}>
            <TooltipTrigger tooltipShown={showing} onVisibilityChange={visibilityChanged} placement="bottom-start" trigger="none" tooltip={tooltip} modifiers={modifiers}>
                {
                    ({getTriggerProps, triggerRef}) => {
                        return (
                            <div {...getTriggerProps({ref: triggerRef, className: 'trigger'})}>
                                {inputRender(inputProps, holderRef, textInputComponent)}
                            </div>
                        );
                    }
                }
            </TooltipTrigger>
        </div>
    );
};


const Autocomplete = styled(_Autocomplete)`
  display: block;
  vertical-align: middle;
  position: relative;

  & input {
    box-sizing: border-box;
  }
`;

export default Autocomplete;



const SmallAutocomplete = ({textInputComponent=SmallTextInput, menuItemComponent=SmallMenuItem, ...rest}) => {
    return <Autocomplete textInputComponent={textInputComponent} menuItemComponent={menuItemComponent} {...rest} />
};


export { Autocomplete, SmallAutocomplete };

export { MenuItem, SmallMenuItem };
export { MenuHolder, MenuHeader, MenuFooter };