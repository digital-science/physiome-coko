const Condition = require('./Condition');

class ValidationDefinition {

    constructor(definition, enumResolver, mappingResolver) {
        this.name = definition.name;
        this.entries = (definition.entries || []).map(entry => new ValidationEntry(entry, enumResolver, mappingResolver));
    }
}


class ValidationEntry {

    constructor(definition, enumResolver, mappingResolver) {

        this.target = definition.target;

        if(definition.warning) {
            this.warning = new ValidationWarning(definition.warning);
        }

        this.condition = new Condition(definition.condition, enumResolver, mappingResolver);
        this.options = definition.options || {};
    }

    get bindings() {
        return this.condition.bindings;
    }

    evaluateCondition(data, audience) {
        return this.condition.evaluate(data, audience);
    }

    evaluateWarning(data) {
        return this.warning ? this.warning.evaluate(data) : null;
    }
}

class ValidationWarning {

    constructor(def) {
        if(typeof def === "string") {
            this.warning = def;
        } else {
            // FIXME: implement me !!
        }
    }

    evaluate(data) {
        return this.warning;
    }
}

module.exports = ValidationDefinition;