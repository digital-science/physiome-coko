const InstanceDefinition = require('./InstanceDefinition');
const EnumDefinition = require('./EnumDefinition');
const MappingDefinition = require('./MappingDefinition');


class WorkflowDescription {

    constructor(definition) {

        const enums = {};
        const mappings = {};

        if(definition.enums) {
            Object.keys(definition.enums).forEach(k => {
                enums[k] = new EnumDefinition(definition.enums[k]);
            });
        }

        if(definition.mappings) {
            Object.keys(definition.mappings).forEach(k => {
                mappings[k] = new MappingDefinition(definition.mappings[k], enums);
            });
        }

        this.enums = enums;
        this.mappings = mappings;

        const enumResolver = function(enumRef, audience) {
            console.log(`enumResolver: ${enumRef} [${audience}]`);
            return resolveEnumFromSet(enums, enumRef, audience);
        };

        const mappingResolver = function(mappingRef) {
            return mappings[mappingRef];
        };

        const tasks = {};

        if(definition.tasks) {
            Object.keys(definition.tasks).forEach(k => {
                tasks[k] = new InstanceDefinition(definition.tasks[k], k, enumResolver, mappingResolver);
            });
        }

        this.instanceTypes = tasks;
    }

    findInstanceType(taskId) {
        return this.instanceTypes[taskId] || null;
    }

    findInstanceTypeForUrlName(name) {
        return Object.values(this.instanceTypes).find(instanceType => instanceType.urlPath === name);
    }

    resolveEnumToValue(enumRef, audience) {
        return resolveEnumFromSet(this.enums, enumRef, audience);
    }

    resolveDisplayMapping(mappingRef) {
        return this.mappings[mappingRef] || null;
    }
}


function resolveEnumFromSet(set, enumRef, audience = 'client') {

    if(!enumRef) {
        return undefined;
    }

    const [name, clientValue] = enumRef.split(".");
    const enumDef = set[name];
    if(!enumDef) {
        return undefined;
    }

    return (audience === 'client') ? clientValue : enumDef.resolve(enumRef);
}

module.exports = WorkflowDescription;