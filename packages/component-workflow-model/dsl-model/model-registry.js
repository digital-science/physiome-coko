const Models = {};
const ModelByGraphQLName = {};

exports.registerModel = function registerModel(name, model) {
    Models[name] = model;
    ModelByGraphQLName[model.graphQLModelName] = model;
};

exports.lookupModel = function lookupModel(name) {
    return Models[name] || null;
};

exports.lookupModelByGraphQLName = function lookupModelByGraphQLName(name) {
    return ModelByGraphQLName[name] || null;
};

exports.models = Models;