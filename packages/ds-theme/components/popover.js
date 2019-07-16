import React, { useState, useCallback } from 'react';
import styled from 'styled-components';

import TooltipTrigger from 'react-popper-tooltip';
import 'react-popper-tooltip/dist/styles.css';



const Tooltip = ({ arrowRef, tooltipRef, getArrowProps, getTooltipProps, placement, renderContent, ...rest }) =>  {

    return (
        <div {...getTooltipProps({ref: tooltipRef, className: 'tooltip-container'})}>
            <div {...getArrowProps({ref: arrowRef, className: 'tooltip-arrow', 'data-placement': placement})} />
            {renderContent(rest)}
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


export { Tooltip };

export default function PopoverTrigger(props) {

    const [tooltipShown, setTooltipShown] = useState(false);

    const onVisibilityChange = useCallback((vis) => {
        setTooltipShown(vis);
        if(props.onVisibilityChange) {
            props.onVisibilityChange(vis);
        }
    }, [props.onVisibilityChange]);

    const dismissTooltip = useCallback(() => {
        setTooltipShown(false);
    }, [setTooltipShown]);

    const renderTooltip = ({arrowRef, tooltipRef, getArrowProps, getTooltipProps, placement}) => {
        return (
            <Tooltip arrowRef={arrowRef} tooltipRef={tooltipRef} getArrowProps={getArrowProps} getTooltipProps={getTooltipProps}
                placement={placement} dismissTooltip={dismissTooltip} {...props} />
        );
    };

    return (
        <TooltipTrigger tooltipShown={tooltipShown} onVisibilityChange={onVisibilityChange} placement={props.placement || "bottom"} trigger={props.trigger || "click"} tooltip={renderTooltip}>
            {
                ({getTriggerProps, triggerRef}) => {
                    return <Trigger getTriggerProps={getTriggerProps} triggerRef={triggerRef} children={props.children} />;
                }
            }
        </TooltipTrigger>
    )
};