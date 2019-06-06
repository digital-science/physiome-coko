import InstanceDefinition from './InstanceDefinition';
import EnumDefinition from './EnumDefinition'

class WorkflowDescription {

    constructor(definition) {

        const enums = {};

        if(definition.enums) {
            Object.keys(definition.enums).forEach(k => {
                enums[k] = new EnumDefinition(definition.enums[k]);
            });
        }

        this.enums = enums;

        const enumResolver = function(enumRef) {
            return resolveEnumFromSet(enums, enumRef);
        };

        const tasks = {};

        if(definition.tasks) {
            Object.keys(definition.tasks).forEach(k => {
                tasks[k] = new InstanceDefinition(definition.tasks[k], k, enumResolver);
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