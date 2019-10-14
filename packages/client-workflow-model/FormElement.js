const Condition = require('./Condition');

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

        if(!this.targets || !this.targets.length) {
            return true;
        }


        console.log(`userIsTargetOfElement: `);
        console.dir(this.targets);
        console.dir(user.groups);

        // Iterate the groups for the user, and then find it that matches any of the targeted groups for the element.
        const userGroups = user.groups || [];

        for(let i = 0; i < this.targets.length; i++) {

            const t = this.targets[i];

            let didMatch = !!t.invert;

            for(let ii = 0; ii < userGroups.length; ii++) {

                const lookupGroup = userGroups[ii];
                const match = t.group === lookupGroup;

                if(match) {

                    // If this is an invert, then this target has failed.
                    if(t.invert) {
                        didMatch = false;
                        break;
                    } else {
                        console.log(`did match (exact): ${JSON.stringify(this.targets)} -> ${JSON.stringify(user.groups)}`);
                        return true;
                    }
                }
            }

            if(didMatch) {
                console.log(`did match (for invert): ${JSON.stringify(this.targets)} -> ${JSON.stringify(user.groups)}`);
                return true;
            }
        }

        console.log(`no match (no targets matched): ${JSON.stringify(this.targets)} -> ${JSON.stringify(user.groups)}`);
        return false;
    }
}

module.exports = FormElement;