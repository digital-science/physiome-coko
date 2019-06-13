import FormElement from './FormElement';

class ViewDefinition {

    constructor(definition, enumResolver, mappingResolver) {

        this.name = definition.view;

        if(definition.extend) {
            this.extends = definition.extend;
        }

        this.options = definition.options || {};
        this.elements = definition.elements ? definition.elements.map(elementDescription => new FormElement(elementDescription, enumResolver, mappingResolver)) : [];
    }
}

export default ViewDefinition;