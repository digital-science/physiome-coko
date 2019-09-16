const ConditionFunctions = {};

ConditionFunctions.length = v => {
    if(v instanceof Array) {
        return v.length;
    }

    if(typeof v === "string") {
        return v.length;
    }

    return 0;
};


ConditionFunctions.hasValue = v => {
    return !!v;
};


function registerConditionFunction(name, method) {
    ConditionFunctions[name] = method;
}

exports.ConditionFunctions = ConditionFunctions;
exports.registerConditionFunction = registerConditionFunction;
