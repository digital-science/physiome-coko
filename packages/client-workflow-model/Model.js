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

    inputFields() {
        return (this.fields || []).filter(f => f.input !== false && (!f.accessors || f.accessors.length === 0));
    }
}

export default Model;