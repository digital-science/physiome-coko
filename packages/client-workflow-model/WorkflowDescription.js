import InstanceDefinition from './InstanceDefinition';
import EnumDefinition from './EnumDefinition';
import MappingDefinition from './MappingDefinition';

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

        const enumResolver = function(enumRef) {
            return resolveEnumFromSet(enums, enumRef);
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

    resolveEnumToValue(enumRef) {
        return resolveEnumFromSet(this.enums, enumRef);
    }

    resolveDisplayMapping(mappingRef) {
        return this.mappings[mappingRef] || null;
    }
}


function resolveEnumFromSet(set, enumRef) {

    if(!enumRef) {
        return undefined;
    }

    const [name, _] = enumRef.split(".");
    const enumDef = set[name];
    if(!enumDef) {
        return undefined;
    }

    return enumDef.resolve(enumRef);
}



export default WorkflowDescription;