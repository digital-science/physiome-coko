class Model {

    constructor(definition) {
        this.fields = definition.elements || [];
    }

    stateFields() {
        return (this.fields || []).filter(f => f.state === true);
    }

    enumFields(workflowDef) {
        if(!workflowDef || !workflowDef.enums || !this.fields || !this.fields.length) {
            return [];
        }
        return this.fields.filter(f => workflowDef.enums.hasOwnProperty(f.type));
    }
}

export default Model;