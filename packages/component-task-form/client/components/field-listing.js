import React, { useContext, useMemo, useEffect, useState } from 'react';
import styled from 'styled-components';

import AuthenticatedUserContext from "component-authentication/client/AuthenticatedUserContext";

import { FormFieldHolder } from './fields/withFormField';


function _FormFieldListing({ className, elements, fieldRegistry, data, binding, options, description, ...elementComponentProps }) {

    if(!elements || !elements.length || !fieldRegistry || !data) {
        return null;
    }


    const currentUser = useContext(AuthenticatedUserContext);
    const [generation, setGeneration] = useState(0);


    const [finalItems, dependentBindings] = useMemo(() => {

        const conditionBindings = {};
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

        const pushConditionBindings = (condition) => {
            const b = condition ? condition.bindings : null;
            if(b) {
                b.forEach(binding => conditionBindings[binding] = true);
            }
        };


        elements.forEach((e, i) => {

            if(!e.userIsTargetOfElement(currentUser)) {
                return;
            }

            // If the type requested is a layout, resolve it and include the elements in question.
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

                            pushConditionBindings(layoutElement.condition);
                            if(layoutElement.condition && !layoutElement.evaluate(data)) {
                                return;
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

            pushConditionBindings(e.condition);
            if(e.condition && !e.condition.evaluate(data)) {
                return;
            }

            pushElement(ElementComponent, e, i);
        });

        const simpleDependentKeys = Object.keys(conditionBindings).map(key => key.split('.')[0]);

        return [items, [...new Set(simpleDependentKeys)]];

    }, [generation, currentUser, elements, fieldRegistry, data, ...Object.values(elementComponentProps)]);


    const formDataWasChanged = () => {
        setGeneration(generation + 1);
    };

    useEffect(() => {

        // For each of the dependent binding, we want to watch the form data for changes and then force updates to reflect
        // the fact that the outcome of the condition evaluation may now have changed.

        if(!data) {
            return;
        }

        dependentBindings.forEach(simpleBinding => {
            data.on(`field.${simpleBinding}`, formDataWasChanged);
        });

        return function cleanup() {
            dependentBindings.forEach(simpleBinding => {
                data.off(`field.${simpleBinding}`, formDataWasChanged);
            });
        };

    }, [generation, dependentBindings]);

    return (
        <div className={`${className || ''} form-field-listing`}>
            {finalItems}
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