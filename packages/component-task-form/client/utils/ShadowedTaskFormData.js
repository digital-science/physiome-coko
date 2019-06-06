import TaskFormData from './TaskFormData';

class ShadowedTaskFormData extends TaskFormData {

    constructor(underlyingData, allowedShadowingFields) {
        super();
        this._underlyingData = underlyingData;
        this._allowedFields = {};

        if(allowedShadowingFields) {
            allowedShadowingFields.forEach(a => this._allowedFields[a] = true);
        }
    }

    getFieldValue(fieldID) {

        if(fieldID.indexOf('.') !== -1) {
            const path = fieldID.split('.');

            if(!this._allowedFields.hasOwnProperty(path[0])) {
                return undefined;
            }

            if(this._modifiedFields.hasOwnProperty(path[0]) || this._defaultValues.hasOwnProperty(path[0])) {
                return super.getFieldValue(fieldID);
            }

            return this._underlyingData.getFieldValue(fieldID);
        }

        if(!this._allowedFields.hasOwnProperty(fieldID)) {
            return undefined;
        }

        if(this._modifiedFields.hasOwnProperty(fieldID)) {
            return this._modifiedFields[fieldID];
        }

        if(this._defaultValues.hasOwnProperty(fieldID)) {
            return this._defaultValues[fieldID];
        }

        return this._underlyingData.getFieldValue(fieldID);
    }

}

export default ShadowedTaskFormData;