import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

import useDebouncedValue from "ds-awards-theme/hooks/useDebouncedValue";
import { SmallTextInput } from "ds-awards-theme/components/text-input";
import { Checkbox, CheckboxLabel } from "ds-awards-theme/components/checkbox-input";
import PopoverTrigger from "component-task-form/client/components/popover";

import { FaFilter } from 'react-icons/fa';


const FilteringHolder = styled.div`
  display: flex;
  flex-wrap: nowrap;
  > * + * {
    margin-left: 10px;
  }
`;

const FilterButton = styled.div`
    color: #505050;
    padding: 4px 4px 1px 4px;
    border: 1px solid #505050;
    border-radius: 4px;
    box-shadow: 1px 1px 2px #50505073;
    cursor: pointer;
    &:hover {
      color: #343434;
      background: #50505020;
    }
`;

const FilterCheckboxListing = styled.div`
  padding: 10px;
  & > div + div {
    margin-top: 5px;
  }
  
  & > div.on-hold-section {
    margin-top: 10px;
    padding-top: 5px;
    border-top: 1px solid #b9b9b9;
  }
`;



function savePhases(filterOptions) {
    const r = {};
    filterOptions.forEach(f => {
        r[f.filter] = f.active;
    });
    return r;
}

function applyPhases(filterOptions, savedState) {
    if(!savedState) {
        return;
    }

    filterOptions.forEach(f => {
        if(savedState.hasOwnProperty(f.filter)) {
            f.setActive(savedState[f.filter]);

        }
    });
}

function deactiveAllPhases(filterOptions) {
    filterOptions.forEach(f => {
        f.setActive(false);
    });
}

function _determineInitialSavedPhases(allFilterPhases, defaultActiveFilterPhases) {
    const r = {};
    if(allFilterPhases) {
        allFilterPhases.forEach(f => r[f] = false);
    }
    if(defaultActiveFilterPhases) {
        defaultActiveFilterPhases.forEach(f => r[f] = true);
    }
    return r;
}


const _SubmissionListingHeader = ({className, showFilter, setFilteredPhases, allFilterPhases, defaultActiveFilterPhases,
                                   searchTextDidChange, searchTextDebounceInterval=300, renderAdditionalFilters=null}) => {

    const [searchText, setSearchText] = useState("");
    const [debouncedSearchText] = useDebouncedValue(searchText, searchTextDebounceInterval);

    const [savedPhases, setSavedPhases] = useState(_determineInitialSavedPhases(allFilterPhases, defaultActiveFilterPhases));


    const handleOnChangeSearchText = (e) => {
        setSearchText(e.target.value || "");
    };

    useEffect(() => {
        if(searchTextDidChange) {
            searchTextDidChange(debouncedSearchText);
        }
    }, [debouncedSearchText]);


    // For each of the supplied filters, we create our checkbox with associated state.
    const filterOptions = allFilterPhases ? allFilterPhases.map(filter => {

        const [checked, setChecked] = useState(defaultActiveFilterPhases ? defaultActiveFilterPhases.indexOf(filter) !== -1 : true);
        const handleOnChange = (e) => {
            setChecked(e.target.checked);
        };
        const checkbox = <CheckboxLabel><Checkbox checked={checked} onChange={handleOnChange} />{filter}</CheckboxLabel>;
        return {filter, active:checked, setActive:setChecked, checkbox};

    }) : [];

    // When the filtering options are changed, notify any interested party.
    if(showFilter && setFilteredPhases) {

        useEffect(() => {

            const newPhases = [];
            filterOptions.forEach(f => {
                if(f.active) {
                    newPhases.push(f.filter);
                }
            });
            
            setFilteredPhases(newPhases);

        }, [...filterOptions.map(f => f.active)]);
    }

    // Utility methods (save current filters, restore saved filters, deactivate all filters)
    const saveCurrentFilters = () => {
        const r = savePhases(filterOptions);
        setSavedPhases(r);
        return r;
    };

    const restoreSavedFilters = () => {
        applyPhases(filterOptions, savedPhases);
    };

    const deactivateAllFilters = () => {
        deactiveAllPhases(filterOptions);
    };


    return (
        <FilteringHolder className={className}>

            <SmallTextInput value={searchText} onChange={handleOnChangeSearchText} placeholder="Search submissions…" />

            {showFilter ? (
                <PopoverTrigger placement="bottom" renderContent={() => {
                    return (
                        <FilterCheckboxListing>
                            {filterOptions.map((filter, index) => <div key={index}>{filter.checkbox}</div> )}
                            {renderAdditionalFilters ? renderAdditionalFilters(saveCurrentFilters, restoreSavedFilters, deactivateAllFilters) : null}
                        </FilterCheckboxListing>
                    );
                }}>
                    <FilterButton>
                        <FaFilter />
                    </FilterButton>
                </PopoverTrigger>
            ) : null }

        </FilteringHolder>
    );
};



const SubmissionListingHeader = styled(_SubmissionListingHeader)`
`;



const HeaderHolder = styled.div`
  display: flex;
  flex-wrap: nowrap;
  align-items: center;
  justify-content: space-between;
  
  > ${SubmissionListingHeader} {
    flex-basis: 20%;
    min-width: 10em;
  }
`;

export default SubmissionListingHeader;

export { HeaderHolder };