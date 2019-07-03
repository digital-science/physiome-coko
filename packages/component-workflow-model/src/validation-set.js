const Condition = require('./condition');
const logger = require('workflow-utils/logger-with-prefix')('validation-set');


function ValidationSet(validations, enums) {

    const resolveEnum = (enumName) => {

        const [enumType, enumValue] = enumName.split(".");
        const type = enums.hasOwnProperty(enumType) ? enums[enumType] : null;

        if(!type) {
            logger.error(`unable to resolve enum ${enumName} during validation set construction (enum not defined)`);
            return null;
        }

        if(!type.values.hasOwnProperty(enumValue)) {
            logger.error(`unable to resolve enum ${enumName} during validation set construction (enum value not present)`);
            return null;
        }

        return type.values[enumValue];
    };

    this.conditions = validations.map(validation => {

        if(!validation || !validation.condition) {
            return null;
        }

        return new Condition(validation.condition, resolveEnum);

    }).filter(v => !!v);
}

ValidationSet.prototype.evaluate = function evaluate(data) {

    for(let i = 0; i < this.conditions.length; i++) {
        if(!this.conditions[i].evaluate(data)) {
            return false;
        }
    }

    return true;
};

ValidationSet.prototype.bindings = function bindings() {

    if(this._allBindings) {
        return this._allBindings;
    }

    const allBindings = {};
    this.conditions.forEach(condition => {

        const b = condition.bindings();
        b.forEach(b => allBindings[b] = true);
    });

    this._allBindings = Object.keys(allBindings);
    return this._allBindings;
};





function resolveValidationSetForFormDefinition(formDef, taskDef, enums) {

    if(!formDef.validations || !formDef.validations.length) {
        return null;
    }

    if(formDef.hasOwnProperty('_resolvedValidationSet')) {
        return formDef._resolvedValidationSet;
    }

    const resolvedValidations = formDef.validations.map(v => taskDef.validations.find(set => set.name === v)).filter(v => !!v);

    if(!resolvedValidations.length) {
        formDef._resolvedValidationSet = null;
        return null;
    }

    const allValidations = [];
    resolvedValidations.forEach(validationSet => allValidations.push.apply(allValidations, validationSet.entries));

    const validationSet = new ValidationSet(allValidations, enums);
    formDef._resolvedValidationSet = validationSet;
    return validationSet;

}


exports.ValidationSet = ValidationSet;
exports.resolveValidationSetForFormDefinition = resolveValidationSetForFormDefinition;