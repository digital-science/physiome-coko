const IdentityFieldType = 'Identity';

const DateTimeFieldType = 'DateTime';

const BaseElementTypes = ['String', 'Integer', 'ID', DateTimeFieldType, 'Boolean', 'JSON'];


class Model {

    constructor(definition, enumResolver = null) {
        this.fields = definition.elements || [];
    }


    static filterFieldsForStateFields(fields) {
        return (fields || []).filter(f => f.state === true);
    }

    stateFields() {
        return this.constructor.filterFieldsForStateFields(this.fields);
    }


    static filterFieldsForBasicTypes(fields, enums) {

        return fields.filter(f => {
            return (BaseElementTypes.indexOf(f.type) !== -1 || enums.hasOwnProperty(f.type));
        });
    }

    basicTypeFields(workflowDef) {
        return this.constructor.filterFieldsForBasicTypes(this.fields, workflowDef.enums);
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

    relationFields(workflowDef) {

        return this.fields.filter(f => {

            if(BaseElementTypes.indexOf(f.type) !== -1) {
                return false;
            }
            return !workflowDef.enums.hasOwnProperty(f.type);
        });
    }

    relationFieldsWithAccessors(workflowDef) {

        return this.relationFields(workflowDef).filter(f => f.accessors && f.accessors.length);
    }

    listingFilterFields() {

        return this.fields.filter(f => {
            return (f.listingFilter === true);
        });
    }

    listingSortableFields() {

        return this.fields.filter(f => {
            return (f.listingSorting === true);
        });
    }

    ownerFields() {

        return this.fields.filter(f => {
            return (f.holdsOwnerId === true && f.type === IdentityFieldType && f.joinField);
        });
    }

    idSequenceFields() {

        return this.fields.filter(f => {
            return (f.idSequence);
        });
    }

    dateTimeFields() {

        return this.fields.filter(f => {
            return (f.type === DateTimeFieldType);
        });
    }

}

module.exports = Model;