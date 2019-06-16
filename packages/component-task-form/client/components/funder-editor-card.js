import React, { useState } from 'react';
import styled from 'styled-components';

import Card from "ds-awards-theme/components/card";
import { SmallBlockLabel } from "ds-awards-theme/components/label";
import { SmallTextInput } from "ds-awards-theme/components/text-input";
import { FaPlus, FaTrashAlt } from 'react-icons/fa';

import { SmallOrganisationAutocomplete } from './organisation-autocomplete';
import { SmallInlineButton } from "ds-awards-theme/components/inline-button";

import { SmallFundingAutocomplete } from './funding-autocomplete';


const FunderEditorRemove = styled(({className, funder, removeFunder}) => {

    return <div className={className || ""} onClick={() => removeFunder(funder)}><FaTrashAlt /></div>
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



const _GrantDetailsRow = ({className}) => {

    const [value, setValue] = useState("");
    const [grant, setGrant] = useState(null);

    const onChange = (value, grant) => {
        setValue(value);
        setGrant(grant);
        return !!grant;
    };

    return (
        <div className={className}>
            <div className="identifier">
                <SmallFundingAutocomplete placeholder="e.g. R01LM011969" entity={grant} value={value} onChange={onChange} />
            </div>
            <div className="extra">

            </div>
        </div>
    );
};

const GrantDetailsRow = styled(_GrantDetailsRow)`

  display: flex;
  justify-content: space-between;
  
  & > div.identifier {
    flex-basis: calc(25%);
  }
    
  & > div.extra {
    flex-basis: calc(75% - 10px);
  }

`;



function _FunderEditorCard({className, funder, removeFunder, didModifyFunder}) {

    const [orgValue, setOrgValue] = useState("");
    const [orgEntity, setOrgEntity] = useState(null);

    const [grantNumbers, setGrantNumbers] = useState([]);

    const onOrgChange = (value, entity) => {

        setOrgValue(value);

        if(entity) {
            funder.organization = entity;
            setOrgEntity(entity);
            didModifyFunder(funder);
        } else {
            funder.organization = {name:value.trim()};
            setOrgEntity(null);
            didModifyFunder(funder);
        }

        return !!entity;
    };

    const addGrantNumber = () => {

    };


    return (
        <Card className={className} reorderingGrabber={true}>

            <FunderFormGroup>
                <SmallBlockLabel>Funding Organisation</SmallBlockLabel>
                <SmallOrganisationAutocomplete value={orgValue} entity={orgEntity} onChange={onOrgChange} placeholder="e.g. National Institutes of Health (NIH)" />
            </FunderFormGroup>

            <FunderFormGroup>
                <SmallBlockLabel>Grants / Projects</SmallBlockLabel>

                <GrantDetailsRow />

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
        flex-basis: 100%;
    }
`;

