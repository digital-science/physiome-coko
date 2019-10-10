const Instances = {};
const InstanceUrlMapping = {};


exports.registerInstance = function registerInstance(name, instance) {
    Instances[name] = instance;
    InstanceUrlMapping[instance.urlMapping] = instance;
};

exports.lookupInstance = function lookupInstance(name) {
    return Instances[name] || null;
};

exports.lookupInstanceByUrlMapping = function lookupInstance(urlPath) {
    return InstanceUrlMapping[urlPath] || null;
};