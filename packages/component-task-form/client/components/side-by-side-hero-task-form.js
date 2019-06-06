import React, {Fragment, useMemo} from 'react';
import styled from 'styled-components';

import useTimedMinimumDisplay from './../hooks/useTimedMinimumDisplay';
import useFormInstanceData from './../hooks/useFormInstanceData';

import FieldListing from './field-listing';


export default function SideBySideHeroTaskForm({ instanceId, taskId, taskName, instanceType, formDefinition, workflowDescription, wasSubmitted, autoSave=true }) {

    const [showIsSaving, displayIsSavingMessage, removeIsSavingMessage] = useTimedMinimumDisplay(1500);

    const fd = useFormInstanceData({instanceId, taskId, taskName, instanceType, formDefinition, workflowDescription, wasSubmitted,
                                    autoSave, displayIsSavingMessage, removeIsSavingMessage});
    const {instance, error, loading, task, resolvedTaskId, submitTaskOutcome, formData, refetchFormData, fieldRegistry} = fd;

    const elements = formDefinition ? formDefinition.elements : null;
    const {panels, decisionPanel} = useMemo(() => {

        if(!elements) {
            return null;
        }

        const panels = [];
        let decisionPanel = null;

        elements.forEach(element => {
            if(element.type === "Panel" && element.children) {
                panels.push(element);
            } else if(element.type === "DecisionPanel") {
                decisionPanel = element;
            }
        });

        return {panels, decisionPanel};

    }, [elements]);


    if(loading) {
        return <div>Loading</div>;
    }

    if(error) {
        return <div>Error: {error}</div>;
    }

    if(!instance) {
        return <div>Instance Not Found</div>
    }

    if(!task) {
        return <div>Task Not Found</div>
    }

    // we want to determine panels
    // and then decision panels

    const fieldListingProps = {fieldRegistry, data:formData, refetchData:refetchFormData, instanceId, instanceType, taskId:resolvedTaskId, submitTaskOutcome};

    return formData ? (
        <SideBySideHeroHolder>

            <PanelHolder>
                {panels.map((panel, index) =>
                    <Fragment key={index}>
                        <Panel>
                            {panel.options && panel.options.heading ? <PanelHeading heading={panel.options.heading} /> : null}
                            <FieldListing elements={panel.children} {...fieldListingProps} />
                        </Panel>
                        {(index !== panels.length - 1) ? <PanelDivider /> : null}
                    </Fragment>
                )}
            </PanelHolder>

            {decisionPanel ? (
                <DecisionPanelHolder>
                    <DecisionFieldListing elements={decisionPanel.children} {...fieldListingProps} />
                </DecisionPanelHolder>
            ) : null}

        </SideBySideHeroHolder>
    ) : (
        <div>Loading</div>
    );
};


const SideBySideHeroHolder= styled.div`
  
`;


const Panel = styled.div`
  min-width: 450px;
`;

const PanelDivider = styled.div`
  min-width: 40px;
  max-width: 40px;
`;


const PanelHeading = styled(({className, heading}) => {
    return (
        <div className={className}>
            <span>{heading}</span>
        </div>
    );
})`
  margin-bottom: 10px;
  
  > span {
    font-size: 18px;
    font-family: ProximaNovaBold, sans-serif;
    color: #424242;
  }
`;

const PanelHolder = styled.div`
  display: flex;
  flex-direction: row;
  max-width: 940px;
  margin: 0 auto;
  justify-content: center;
`;


const DecisionPanelHolder = styled.div`
  margin-top: 10px;
  margin-bottom: -20px;
  margin-left: -20px;
  margin-right: -20px;
  padding: 20px;
  background: #ebebeb;
`;


const DecisionFieldListing = styled(FieldListing)`
  
  max-width: unset;
  display: flex;
  justify-content: center;
  
  > .form-field {
    display: inline-block;
    margin-left: 5px;
    margin-right: 5px;
  }
`;