import FormElement from './FormElement';
import LayoutDefinition from './LayoutDefinition';

class ViewDefinition extends LayoutDefinition {

    constructor(definition, enumResolver, mappingResolver) {

        super();
        this.name = definition.view;

        if(definition.extend) {
            this.extends = definition.extend;
        }

        this.options = definition.options || {};
        this.elements = definition.elements ? definition.elements.map(elementDescription => new FormElement(elementDescription, enumResolver, mappingResolver)) : [];
    }
}

export default ViewDefinition;