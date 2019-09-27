const LayoutDefinition = require('./LayoutDefinition');

class ViewDefinition extends LayoutDefinition {

    constructor(definition, enumResolver, mappingResolver) {

        super(definition.view, definition, enumResolver, mappingResolver);

        if(definition.extend) {
            this.extends = definition.extend;
        }

        this.options = definition.options || {};
    }
}

module.exports = ViewDefinition;
