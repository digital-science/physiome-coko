const FormElement = require('./FormElement');

class LayoutDefinition {

    constructor(name, definition, enumResolver, mappingResolver) {

        this.name = name || definition.layout;
        this.elements = definition.elements ? definition.elements.map(elementDescription => new FormElement(elementDescription, enumResolver, mappingResolver)) : [];
    }

}

module.exports = LayoutDefinition;