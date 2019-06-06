import FormElement from './FormElement';

class FormDefinition {

    constructor(definition, enumResolver) {

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
                    outcome.state[k] = enumResolver(pair.value);
                    outcome._graphqlState[k] = pair.value.split(".")[1];
                } else {
                    outcome.state[k] = pair.value;
                    outcome._graphqlState[k] = pair.value;
                }
            });
        });

        this.elements = definition.elements ? definition.elements.map(elementDescription => new FormElement(elementDescription, enumResolver)) : [];
    }

    findMatchingOutcome(outcomeType) {
        return this.outcomes.find(outcome => outcome.type === outcomeType) || null;
    }
}

export default FormDefinition;