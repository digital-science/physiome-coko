const Models = {};

exports.registerModel = function registerModel(name, model) {
    Models[name] = model;
};

exports.lookupModel = function lookupModel() {
    return Models[name] || null;
};