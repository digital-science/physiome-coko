import React from 'react';
import styled from 'styled-components';

import { FormFieldHolder } from './fields/withFormField';


function _FormFieldListing({ className, elements, fieldRegistry, data, binding, options, description, ...elementComponentProps }) {

    if(!elements || !elements.length || !fieldRegistry || !data) {
        return null;
    }

    const items = [];

    const pushElement = (ElementComponent, e, key) => {
        items.push(
            <ElementComponent key={key} className={`type-${e.type.toLowerCase()}`} binding={e.binding} options={e.options || {}} fieldRegistry={fieldRegistry}
                description={e} data={data} {...elementComponentProps} />
        );
    };

    const pushUnknownElement = (key) => {
        items.push(<div key={key}>Unknown Element Type</div>);  //FIXME: this is displayed for debugging purposes only
    };

    /*const items = */
    elements.forEach((e, i) => {

        if(e.type === "Layout") {

            const { instanceType } = elementComponentProps;
            if(instanceType && e.options.layout) {

                const layout = instanceType.layoutDefinitionForLayoutName(e.options.layout);
                if(layout && layout.elements) {

                    layout.elements.forEach((layoutElement, layoutIndex) => {

                        const key = `${i}-${layoutIndex}`;
                        const LayoutElementComponent = fieldRegistry[layoutElement.type];

                        if(!LayoutElementComponent) {
                            return pushUnknownElement(key);
                        }

                        return pushElement(LayoutElementComponent, layoutElement, key);
                    });
                }
            }

            return;
        }

        const ElementComponent = fieldRegistry[e.type];
        if(!ElementComponent) {
            return pushUnknownElement(i);
        }

        if(e.condition && !e.condition.evaluate(data)) {
            return null;
        }

        pushElement(ElementComponent, e, i);
    });

    return (
        <div className={`${className || ''} form-field-listing`}>
            {items}
        </div>
    );
}

export default styled(_FormFieldListing)`
    max-width: 750px;
    
    & > ${FormFieldHolder} + ${FormFieldHolder} {
        margin-top: 25px;
    }
    
    & > ${FormFieldHolder}:last-child {
          margin-bottom: 35px;
    }
`;