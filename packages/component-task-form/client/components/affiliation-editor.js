import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

import { SmallTextInput } from "ds-awards-theme/components/text-input";
import { SmallInlineButton } from "ds-awards-theme/components/inline-button";

import { SmallOrganisationAutocomplete } from './organisation-autocomplete';

import { FaPlus, FaTimesCircle } from 'react-icons/fa';



const _AffiliationEditorRow = ({className, affiliation, showRemoveIcon, removeAffiliation, affiliationWasModified}) => {

    const [orgValue, setOrgValue] = useState((affiliation && affiliation.organization) ? (affiliation.organization.name || "") : "");
    const [orgEntity, setOrgEntity] = useState(affiliation ? affiliation.organization : null);
    const [departmentValue, setDepartmentValue] = useState(affiliation ? (affiliation.department || "") : "");

    useEffect(() => {

        setOrgValue((affiliation && affiliation.organization) ? (affiliation.organization.name || "") : "");
        setOrgEntity(affiliation ? affiliation.organization : null);

        setDepartmentValue(affiliation ? (affiliation.department || "") : "");

    }, [affiliation]);

    const onOrgChange = (value, entity) => {

        setOrgValue(value);

        if(entity) {

            affiliation.organization = entity;
            setOrgEntity(entity);
            affiliationWasModified(affiliation);

        } else {

            affiliation.organization = {name:value.trim()};
            setOrgEntity(null);
            affiliationWasModified(affiliation);
        }

        return !!entity;
    };

    const onDepartmentValueChange = (event) => {

        const value = event.target.value || "";

        setDepartmentValue(value);

        const cleanedValue = value.trim();

        if(cleanedValue && cleanedValue.length) {
            affiliation.department = cleanedValue;
        } else {
            delete affiliation.department;
        }

        affiliationWasModified(affiliation);
    };

    return (
        <div className={`${className} ${showRemoveIcon ? "has-remove" : ""}`}>
            <div>
                <SmallOrganisationAutocomplete value={orgValue} entity={orgEntity} onChange={onOrgChange} placeholder="Organisation" />
            </div>

            <div>
                <SmallTextInput placeholder="Department / Unit" value={departmentValue} onChange={onDepartmentValueChange} />
            </div>

            {showRemoveIcon ? <div className={"actions"}><FaTimesCircle onClick={() => removeAffiliation(affiliation)} /></div> : null}
        </div>
    )
};

const AffiliationEditorRow = styled(_AffiliationEditorRow)`

    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    
    width: 100%;
    margin-top: 5px;
    
    & > div {
      flex-basis: calc(50% - 10px);
    }
    &.has-remove > div {
      flex-basis: calc(50% - 20px);
    }

    
    & > div.actions {
       flex-basis: 10px;
       margin-top: 5px;
       color: #b3b3b3;
    }
    
    & svg {
      cursor: pointer;
    }
`;



const AffiliationListingHolder = styled.div`
`;


const _AffiliationEditor = ({className, value, onChange}) => {

    const [affiliations, setAffiliations] = useState((value && value instanceof Array && value.length) ? value : [{}]);

    const addAffiliation = () => {
        const newAffiliationsList = (affiliations || []).splice(0);
        newAffiliationsList.push({});

        setAffiliations(newAffiliationsList);
        onChange(newAffiliationsList);
    };

    const removeAffiliation = (affiliation) => {

        const newAffiliationsList = affiliations.splice(0).filter(a => a !== affiliation);
        setAffiliations(newAffiliationsList);
        onChange(newAffiliationsList);
    };

    const affiliationWasModified = (aff) => {
        onChange(affiliations);
    };

    useEffect(() => {
        setAffiliations((value && value instanceof Array && value.length) ? value : [{}]);
    }, [value]);

    return (
        <div className={className}>
            <AffiliationListingHolder>
                {affiliations.map((aff, index) =>
                    <AffiliationEditorRow key={index} affiliation={aff} showRemoveIcon={affiliations.length > 1}
                        removeAffiliation={removeAffiliation} affiliationWasModified={affiliationWasModified} />
                )}
            </AffiliationListingHolder>

            <div className="bottom">
                <SmallInlineButton icon={<FaPlus />} bordered={true} onClick={addAffiliation}>Add Affiliation</SmallInlineButton>
            </div>
        </div>
    );
};

export default styled(_AffiliationEditor)`

  & > .bottom {
    margin-top: 8px;
  }
  
`;