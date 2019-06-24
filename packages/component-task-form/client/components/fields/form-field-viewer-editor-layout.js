import React, { useMemo, useState } from 'react';
import styled from 'styled-components';

import FieldListing from '../field-listing';
import withFormField from './withFormField'

import { PanelHeading } from '../master-detail-layout';

import { InlineButton } from 'ds-awards-theme/components/inline-button';
import { FaEye, FaPencilAlt } from 'react-icons/fa';


/**
 * @return {null}
 */

function FormFieldViewerEditorLayout({className, description, options = {}, ...rest}) {

    const [viewerIsPicked, setViewerIsPicked] = useState(true);
    const layouts = useMemo(() => {

        const { children } = description;
        if(!children || !children.length) {
            return null;
        }
        const layoutElements = children.filter(e => e.type === "Layout");
        const { instanceType } = rest;

        return layoutElements.map(elememnt => instanceType.layoutDefinitionForLayoutName(elememnt.options.layout));

    }, [description, description ? description.children : null]);

    if(layouts.length !== 2) {
        console.error("ViewerEditorLayout requires exactly two children, both of which are 'Layout' elements.");
        return null;
    }

    const icon = viewerIsPicked ? <FaPencilAlt/> : <FaEye/>;
    const toggleViewEditMode = () => {
        setViewerIsPicked(!viewerIsPicked);
    };

    return (
        <FormFieldViewerEditorLayoutHolder className={className}>
            <PanelHeading heading={options.heading}>
                <InlineButton bordered={true} icon={icon} onClick={toggleViewEditMode}>
                    {viewerIsPicked ? (options.editLabel || "Edit") : (options.viewLabel || "View")}
                </InlineButton>
            </PanelHeading>

            <FieldListing elements={viewerIsPicked ? layouts[0].elements : layouts[1].elements } {...rest} />
        </FormFieldViewerEditorLayoutHolder>
    );
}

const FormFieldViewerEditorLayoutHolder = styled.div`
  position: relative;
  
  & > ${PanelHeading} > ${InlineButton} {
    float: right;
  }
  
`;

export default withFormField(FormFieldViewerEditorLayout);

export { FormFieldViewerEditorLayoutHolder };