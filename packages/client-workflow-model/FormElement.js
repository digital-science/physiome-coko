import Condition from './Condition'

class FormElement {

    constructor(definition, enumResolver, mappingResolver) {
        this.type = definition.element;

        if(definition.binding) {
            this.binding = definition.binding;
        }

        if(definition.targets && definition.targets.length) {
            this.targets = definition.targets;
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

    userIsTargetOfElement(user) {

        if(!this.targets) {
            return true;
        }

        if(!user.groups) {
            return false;
        }

        // Iterate the groups for the user, and then find it that matches any of the targeted groups for the element.
        for(let i = 0; i < user.groups.length; i++) {

            const lookupGroup = user.groups[i];

            for(let ii = 0; ii < this.targets.length; ii++) {

                const t = this.targets[ii];
                const r = t.invert ? t.group !== lookupGroup : t.group === lookupGroup;

                if(r) {
                    return true;
                }
            }
        }

        return false;
    }
}

export default FormElement;