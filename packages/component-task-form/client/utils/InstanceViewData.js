import EventEmitter from 'event-emitter';

function _get(obj, key) {
    if(obj && obj.hasOwnProperty(key)) {
        return obj[key];
    }
    return null;
}


class InstanceViewData {

    constructor(initialData = {}) {
        this._defaultValues = {...initialData};
    }

    getFieldValue(fieldID) {

        if(fieldID.indexOf('.') !== -1) {
            const path = fieldID.split('.');
            let obj =  this._defaultValues;

            for(let i = 0; i < path.length; i++) {
                obj = _get(obj, path[i]);
                if(!obj) {
                    break;
                }
            }

            return obj;
        }
        return this._defaultValues[fieldID] || undefined;
    }

    setFieldValue(fieldID, value) {
        throw new Error('InstanceViewData does not support modifying data values.');
    }

    setFieldValueForComplexObject(fieldID, value) {
        throw new Error('InstanceViewData does not support modifying data values.');
    }

    resetFieldValue(fieldID) {
        throw new Error('InstanceViewData does not support modifying data values.');
    }

    supportsUpdates() {
        return false;
    }
}

EventEmitter(InstanceViewData.prototype);

export default InstanceViewData;