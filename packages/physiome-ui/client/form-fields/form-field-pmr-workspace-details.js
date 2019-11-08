import React, { useState, useCallback, useEffect } from 'react';
import styled from 'styled-components';
import { th } from 'ds-theme';

import { withFormField, useFormValueBindingForComplexObject } from 'component-task-form/client';

import Card from 'ds-theme/components/card';
import { BlockLabel, SmallBlockLabel } from 'ds-theme/components/label';
import { SmallInlineButton } from 'ds-theme/components/inline-button';
/*
import StaticText from 'ds-theme/components/static-text';*/

import { SmallTextInput } from 'ds-theme/components/text-input';


function FormFieldPMRWorkspaceDetails({data, binding, instanceId, instanceType, saveData, refetchData, options = {}}) {

    const [pmrWorkspaceDetails, setPmrWorkspaceDetails] = useFormValueBindingForComplexObject(data, binding, null);

    const [workspaceId, setWorkspaceId] = useState((pmrWorkspaceDetails && pmrWorkspaceDetails.workspaceId) || "");
    const [changeSetHash, setChangeSetHash] = useState((pmrWorkspaceDetails && pmrWorkspaceDetails.changeSetHash) || "");
    const [hasChanges, setHasChanges] = useState(false);

    const handleWorkspaceIdChange = useCallback((e) => {
        const newWorkspaceId = e.target.value || null;
        setWorkspaceId(newWorkspaceId || "");

        if(!pmrWorkspaceDetails || pmrWorkspaceDetails.workspaceId !== newWorkspaceId) {
            setHasChanges(true);
        }
    }, [pmrWorkspaceDetails, setWorkspaceId]);

    const handleChangeSetHashChange = useCallback((e) => {
        const newChangeSetHash = e.target.value || null;
        setChangeSetHash(newChangeSetHash || "");

        if(!pmrWorkspaceDetails || pmrWorkspaceDetails.changeSetHash !== newChangeSetHash) {
            setHasChanges(true);
        }
    }, [pmrWorkspaceDetails, setChangeSetHash]);

    const saveChanges = useCallback(() => {

        const d = pmrWorkspaceDetails || {};
        d.workspaceId = workspaceId;
        d.changeSetHash = changeSetHash;
        setPmrWorkspaceDetails(d);
        setHasChanges(false);

    }, [pmrWorkspaceDetails, setPmrWorkspaceDetails, setHasChanges, workspaceId, changeSetHash]);

    const revertChanges = useCallback(() => {

        setWorkspaceId((pmrWorkspaceDetails && pmrWorkspaceDetails.workspaceId) || "");
        setChangeSetHash((pmrWorkspaceDetails && pmrWorkspaceDetails.changeSetHash) || "");
        setHasChanges(false);

    }, [pmrWorkspaceDetails, setWorkspaceId, setChangeSetHash, setHasChanges]);

    useEffect(() => {

        setWorkspaceId((pmrWorkspaceDetails && pmrWorkspaceDetails.workspaceId) || "");
        setChangeSetHash((pmrWorkspaceDetails && pmrWorkspaceDetails.changeSetHash) || "");
        setHasChanges(false);

    }, [pmrWorkspaceDetails]);


    const workspacePreviewLink = workspaceId && changeSetHash ? `https://models.physiomeproject.org/workspace/${encodeURI(workspaceId)}/@@file/${encodeURI(changeSetHash)}/` : null;
    const workspaceArchiveDownloadLink = workspaceId && changeSetHash ? `https://models.physiomeproject.org/workspace/${encodeURI(workspaceId)}/@@archive/${encodeURI(changeSetHash)}/tgz` : null;

    return (
        <PMRWorkspaceDetailsHolder>
            {options.label ? <BlockLabel>{options.label}</BlockLabel> : null}

            <div className={'input-group'}>
                <SmallBlockLabel>PMR Workspace Identifier</SmallBlockLabel>
                <SmallTextInput value={workspaceId} onChange={handleWorkspaceIdChange} />
            </div>

            <div className={'input-group'}>
                <SmallBlockLabel>Change Set Hash</SmallBlockLabel>
                <SmallTextInput value={changeSetHash} onChange={handleChangeSetHashChange} />
            </div>

            { workspacePreviewLink ? (
                <div className={'link-group'}>
                    <a href={workspacePreviewLink} target="_blank" rel="noopener noreferrer">View PMR Workspace</a>
                    <a href={workspaceArchiveDownloadLink} target="_blank" rel="noopener noreferrer">Download Archive</a>
                </div>
            ) : null }

            { hasChanges ? (
                <div className={'confirm-changes'}>
                    <SmallBlockLabel>Confirm changes to the PMR workspace that will be used when publishing this article into figshare.</SmallBlockLabel>
                    <div>
                        <SmallInlineButton bordered={true} onClick={revertChanges}>Revert</SmallInlineButton>
                        <SmallInlineButton bordered={true} onClick={saveChanges}>Save</SmallInlineButton>
                    </div>
                </div>
            ) : null }

        </PMRWorkspaceDetailsHolder>
    );
}

const PMRWorkspaceDetailsHolder = styled.div`

    & div.input-group ${SmallBlockLabel} {
        font-size: 14px;
    }
    
    & div + div {
        margin-top: 10px;
    }
    
    & div.link-group {
        font-family: ${th("label.fontFamily")};
        font-size: 14px;
        > a {
            display: block;
        }
    }
    
    & div.confirm-changes {
        padding: 8px;
        background: aliceblue;
        
        > ${SmallBlockLabel} {
            font-style: italic;
            padding-bottom: 10px;
        }
        
        > div {
            display: flex;
            justify-content: flex-end;
    
            > button {
                background: white;
            }
            > button + button {
                margin-left: 5px;
            }
        }
    }
`;

export default withFormField(FormFieldPMRWorkspaceDetails);