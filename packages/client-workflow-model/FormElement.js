import Condition from './Condition'

class FormElement {

    constructor(definition, enumResolver) {
        this.type = definition.element;

        if(definition.binding) {
            this.binding = definition.binding;
        }

        this.options = definition.options || {};

        if(definition.condition) {
            this.condition = new Condition(definition.condition, enumResolver);
        }

        if(definition.children) {
            this.children = definition.children.map(childDef => new FormElement(childDef, enumResolver));
        }
    }
}

export default FormElement;