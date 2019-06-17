import React, { useState, useEffect } from 'react';
import { nextUniqueIdInArray, assignUniqueIdsToArrayItems } from '../utils/helpers';
import styled from 'styled-components';

import Card from "ds-awards-theme/components/card";
import { SmallBlockLabel } from "ds-awards-theme/components/label";
import { FaPlus, FaTrashAlt, FaTimesCircle } from 'react-icons/fa';

import { SmallOrganisationAutocomplete } from './organisation-autocomplete';
import { SmallInlineButton } from "ds-awards-theme/components/inline-button";
import { SmallFundingAutocomplete } from './funding-autocomplete';


const FunderEditorRemove = styled(({className, funder, removeFunder}) => {

    return <div className={className || ""} onClick={() => removeFunder(funder)}><FaTrashAlt /></div>;

})`
    color: #b3b3b3;
    position: absolute;
    right: -20px;
    bottom: -11px;
    font-size: 12px;
    cursor: pointer;
    border-top: 1px solid #d0d0d0;
    border-left: 1px solid #d0d0d0;
    padding: 4px;
    border-top-left-radius: 5px;
      
    &:hover {
        color: #505050;
        background: #d0d0d0;
    }
`;

const FunderFormGroup = styled.div`
  margin-bottom: 8px;
  
  & .bottom {
    margin-top: 8px;
  }
`;


const GrantExtraDetails = styled.div`

  font-family: ProximaNovaLight, sans-serif;
  font-size: 12px;
  color: #505050;
  
  & .grant-info {
      line-height: 1.15em;
      max-height: 1.15em;
      
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
  }

  & .grant-info a {
      color: initial;
      text-decoration: none;
  }
  
  & .funder-info {
      margin-top: 2px;
      font-size: 11px;
      line-height: 1.15em;
      max-height: 1.15em;
      
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
  }
  
  & .funder-info ol {
      margin: 0;
      padding: 0;
      list-style: none;
  }
  
  & .funder-info ol li {
      display: inline-block;
  }
  
  & .funder-info ol li > span:before {
      content: " ("
  }
  
  & .funder-info ol li > span:after {
      content: ")"
  }
`;


const _GrantDetailsRow = ({className, grantNumber, onChange, removeGrantNumber, showRemoveIcon}) => {

    const [value, setValue] = useState("");
    const [grant, setGrant] = useState(null);

    useEffect(() => {
        setValue(grantNumber.projectNumber || "");
        setGrant(grantNumber.entity || null);
    }, [grantNumber]);

    const onChangeFundingReference = (value, entity) => {

        setValue(value);
        setGrant(entity);

        if(entity) {
            grantNumber.projectNumber = entity.projectNumber || value;
            grantNumber.entity = entity;
        } else if(value) {
            grantNumber.projectNumber = value;
            delete grantNumber.entity;
        } else {
            delete grantNumber.projectNumber;
            delete grantNumber.entity;
        }

        onChange(grantNumber);
        return !!entity;
    };

    return (
        <div className={`${className} ${showRemoveIcon ? "remove" : ""}`}>
            <div className="identifier">
                <SmallFundingAutocomplete placeholder="e.g. R01LM011969" entity={grant} value={value} onChange={onChangeFundingReference}
                    showRemoveButton={showRemoveIcon} removeEntity={(entity) => removeGrantNumber(grantNumber)} />
            </div>

            <div className="extra">
                {grant ?
                    (
                        <GrantExtraDetails>
                            <div className="grant-info">
                                <span>{grant.link ? <a href={grant.link} target="_blank">{grant.title}</a> : <React.Fragment>grant.title</React.Fragment>}</span>
                            </div>
                            {(grant.funders && grant.funders.length) ?
                                (
                                    <div className="funder-info">
                                        <ol className="funders-list">
                                            {grant.funders.map(funder =>
                                                <li key={funder.id}>
                                                    {funder.name}{funder.acronym ? <span>{funder.acronym}</span> : null}
                                                </li>
                                            )}
                                        </ol>
                                    </div>
                                )
                                : null
                            }
                        </GrantExtraDetails>
                    )
                    : null
                }
            </div>
        </div>
    );
};

const GrantDetailsRow = styled(_GrantDetailsRow)`

  display: flex;
  justify-content: space-between;
  
  & > div.identifier {
    flex-basis: calc(25%);
    min-width: 25%;
  }
    
  & > div.extra {
    flex-basis: calc(75% - 10px);
    max-width: calc(75% - 10px);
  }
`;


function _FunderEditorCard({className, funder, removeFunder, didModifyFunder}) {

    const [orgValue, setOrgValue] = useState((funder && funder.organization) ? (funder.organization.name || "") : "");
    const [orgEntity, setOrgEntity] = useState((funder && funder.organization && funder.organization.id) ? funder.organization : null);
    const [grantNumbers, setGrantNumbers] = useState(assignUniqueIdsToArrayItems((funder && funder.grants) ? funder.grants : []));

    useEffect(() => {

        if(funder.organization) {
            setOrgEntity(funder.organization.id ? funder.organization : null);
            setOrgValue(funder.organization.name || "");
        } else {
            setOrgValue("");
            setOrgEntity(null);
        }

        setGrantNumbers(assignUniqueIdsToArrayItems(funder.grants || []));

    }, [funder]);

    const onOrgChange = (value, entity) => {

        setOrgValue(value);

        if(entity) {
            funder.organization = entity;
            setOrgEntity(entity);
        } else {
            funder.organization = {name:value.trim()};
            setOrgEntity(null);
        }

        didModifyFunder(funder);
        return !!entity;
    };

    const addGrantNumber = () => {
        const newGrantNumber = {id:nextUniqueIdInArray(grantNumbers)};
        const newGrantNumberList = (grantNumbers || []).splice(0);

        newGrantNumberList.push(newGrantNumber);
        setGrantNumbers(newGrantNumberList);

        funder.grants = newGrantNumberList;
        didModifyFunder(funder);
    };

    const removeGrantNumber = (item) => {

        const id = item.id;
        const newGrantsList = grantNumbers.splice(0).filter(gn => gn.id !== id);

        setGrantNumbers(newGrantsList);

        if(grantNumbers.length) {
            funder.grants = newGrantsList;
        } else {
            delete funder.grants;
        }

        didModifyFunder(funder);
    };

    const grantNumberModified = (gn) => {
        didModifyFunder(funder);
    };


    return (
        <Card className={className} reorderingGrabber={true}>

            <FunderFormGroup>
                <SmallBlockLabel>Funding Organisation</SmallBlockLabel>
                <SmallOrganisationAutocomplete value={orgValue} entity={orgEntity} onChange={onOrgChange} placeholder="e.g. National Institutes of Health (NIH)" />
            </FunderFormGroup>

            <FunderFormGroup>
                <SmallBlockLabel>Grants / Projects</SmallBlockLabel>

                <div className="grant-details">
                    {grantNumbers && grantNumbers.length ?
                        grantNumbers.map(grantNumber =>
                            <GrantDetailsRow key={grantNumber.id} grantNumber={grantNumber} removeGrantNumber={removeGrantNumber}
                                onChange={grantNumberModified} showRemoveIcon={grantNumbers.length > 1} />
                        )
                        : null}
                </div>

                <div className="bottom">
                    <SmallInlineButton icon={<FaPlus />} bordered={true} onClick={addGrantNumber}>Add Grant / Project</SmallInlineButton>
                </div>

            </FunderFormGroup>

            <FunderEditorRemove funder={funder} removeFunder={removeFunder} />
        </Card>
    )
}

export default styled(_FunderEditorCard)`
    
    & .content {
        position: relative;
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        flex-wrap: wrap;
    }
    
    & .content ${FunderFormGroup} {
        box-sizing: content-box;
        flex-basis: 100%;
        max-width: 100%;
    }
    
    & .content div.grant-details > ${GrantDetailsRow} + ${GrantDetailsRow} {
        margin-top: 8px;
    }
`;

