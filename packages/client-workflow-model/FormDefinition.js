const LayoutDefinition = require('./LayoutDefinition');

class FormDefinition extends LayoutDefinition {

    constructor(definition, enumResolver, mappingResolver) {

        super(definition.form, definition, enumResolver, mappingResolver);

        if(definition.extend) {
            this.extends = definition.extend;
        }

        this.options = definition.options || {};
        this.outcomes = definition.outcomes || [];

        this.outcomes.forEach(outcome => {

            if(!outcome.state) {
                return;
            }

            outcome._graphqlState = {};

            Object.keys(outcome.state).forEach(k => {

                const pair = outcome.state[k];

                if(pair.type === "enum") {
                    outcome.state[k] = enumResolver(pair.value, 'server');
                    outcome._graphqlState[k] = enumResolver(pair.value, 'client');
                } else {
                    outcome.state[k] = pair.value;
                    outcome._graphqlState[k] = pair.value;
                }
            });
        });

        this._validations = definition.validations;
    }

    findMatchingOutcome(outcomeType) {
        return this.outcomes.find(outcome => outcome.type === outcomeType) || null;
    }

    findMatchingValidations(formElement) {

        if(!this.validations || !this.validations.length) {
            return null;
        }

        if(!formElement.binding) {
            return null;
        }

        const m = this.validations.filter(v => v.target === formElement.binding);
        return m.length ? m : null;
    }

    _resolveValidations(validations) {

        const sets = (this._validations || []).map(name => validations[name]).filter(v => !!v);
        const allEntries = [];

        sets.forEach(set => {
            (set.entries || []).forEach(entry => {
                if(allEntries.indexOf(entry) === -1) {
                    allEntries.push(entry);
                }
            });
        });

        this.validations = allEntries;
        delete this._validations;
    }
}

module.exports = FormDefinition;