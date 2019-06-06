import React from 'react';
import styled from 'styled-components';

import useTimedMinimumDisplay from './../hooks/useTimedMinimumDisplay';
import useFormInstanceData from './../hooks/useFormInstanceData';

import FieldListing from './field-listing';

import TooltipTrigger from 'react-popper-tooltip';
import 'react-popper-tooltip/dist/styles.css';


const PopoverTaskFormContent = function({ instanceId, taskId, taskName, instanceType, formDefinition, workflowDescription, wasSubmitted, autoSave=true }) {

    const [showIsSaving, displayIsSavingMessage, removeIsSavingMessage] = useTimedMinimumDisplay(1000);

    const fd = useFormInstanceData({instanceId, taskId, taskName, instanceType, formDefinition, workflowDescription, wasSubmitted,
                                    autoSave, displayIsSavingMessage, removeIsSavingMessage});
    const {instance, error, loading, task, resolvedTaskId, submitTaskOutcome, formData, refetchFormData, fieldRegistry} = fd;

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

    const fieldListingProps = {fieldRegistry, data:formData, refetchData:refetchFormData, instanceId, instanceType, taskId:resolvedTaskId, submitTaskOutcome};

    return formData ? (
        <div>
            <FieldListing elements={formDefinition.elements} {...fieldListingProps} />
        </div>
    ) : (
        <div>Loading</div>
    );
};


const TaskFormTooltip = ({ instanceId, taskId, taskName, instanceType, formDefinition, workflowDescription, wasSubmitted, autoSave=true,
                           arrowRef, tooltipRef, getArrowProps, getTooltipProps, placement }) =>  {

    return (
        <div {...getTooltipProps({ref: tooltipRef, className: 'tooltip-container'})}>
            <div {...getArrowProps({ref: arrowRef, className: 'tooltip-arrow', 'data-placement': placement})} />
            <PopoverTaskFormContent instanceId={instanceId} taskId={taskId} taskName={taskName} instanceType={instanceType} formDefinition={formDefinition}
                workflowDescription={workflowDescription} wasSubmitted={wasSubmitted} autoSave={autoSave} />
        </div>
    );
};


const TriggerWrapper = styled.div`
  display: inline-block;
`;


function Trigger({getTriggerProps, triggerRef, children}) {
    return (
        <TriggerWrapper {...getTriggerProps({ref: triggerRef, className: 'trigger'})}>
            {children}
        </TriggerWrapper>
    );
}


export { TaskFormTooltip, PopoverTaskFormContent };

export default function InlineTaskFormPopoverTrigger(props) {

    return (
        <TooltipTrigger placement={props.placement || "bottom"} trigger={props.trigger || "click"} tooltip={({
            arrowRef,
            tooltipRef,
            getArrowProps,
            getTooltipProps,
            placement
        }) => {
            return <TaskFormTooltip arrowRef={arrowRef} tooltipRef={tooltipRef} getArrowProps={getArrowProps}
                getTooltipProps={getTooltipProps} placement={placement} {...props} />;
        }}>
            {
                ({getTriggerProps, triggerRef}) => {
                    return <Trigger getTriggerProps={getTriggerProps} triggerRef={triggerRef} children={props.children} />;
                }
            }
        </TooltipTrigger>
    )

};