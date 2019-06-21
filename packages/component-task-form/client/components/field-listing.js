import React from 'react';
import styled from 'styled-components';

import { FormFieldHolder } from './fields/withFormField';


function _FormFieldListing({ className, elements, fieldRegistry, data, binding, options, description, ...elementComponentProps }) {

    if(!elements || !elements.length || !fieldRegistry || !data) {
        return null;
    }

    const items = elements.map((e, i) => {

        const ElementComponent = fieldRegistry[e.type];
        if(ElementComponent) {
            
            if(e.condition && !e.condition.evaluate(data)) {
                return null;
            }

            return <ElementComponent key={i} className={`type-${e.type.toLowerCase()}`} binding={e.binding} options={e.options || {}} fieldRegistry={fieldRegistry}
                description={e} data={data} {...elementComponentProps} />;
        }

        return <div key={i}>Unknown Element Type</div>;  //FIXME: this is displayed for debugging purposes only
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