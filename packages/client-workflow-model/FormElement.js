import Condition from './Condition'

class FormElement {

    constructor(definition, enumResolver, mappingResolver) {
        this.type = definition.element;

        if(definition.binding) {
            this.binding = definition.binding;
        }

        this.options = definition.options || {};

        Object.keys(this.options).forEach(k => {

            const v = this.options[k];
            if(v && typeof v === 'object' && v.type === "mapping" && v.mapping) {
                this.options[k] = mappingResolver(v.mapping);
            }
        });

        if(definition.condition) {
            this.condition = new Condition(definition.condition, enumResolver, mappingResolver);
        }

        if(definition.children) {
            this.children = definition.children.map(childDef => new FormElement(childDef, enumResolver, mappingResolver));
        }
    }
}

export default FormElement;