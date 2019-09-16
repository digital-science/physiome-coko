function nextUniqueIdInArray(array, idField='id') {

    if(!array || !array.length) {
        return 1;
    }

    let maxId = undefined;
    array.forEach(item => {
        if(item.hasOwnProperty(idField) && (item[idField] > maxId || maxId === undefined)) {
            maxId = item[idField];
        }
    });
    return (maxId !== undefined) ? maxId + 1 : 1;
}

function assignUniqueIdsToArrayItems(array, idField='id') {

    let nextId = undefined;
    array.forEach(a => {
        if(!a.hasOwnProperty(idField)) {
            if(nextId === undefined) {
                nextId = nextUniqueIdInArray(array, idField);
            }
            a[idField] = nextId;
            ++nextId;
        }
    });
    return array;
}

export { nextUniqueIdInArray, assignUniqueIdsToArrayItems };



function bindingToFetchFields(fieldName) {

    if(!fieldName) {
        return null;
    }

    const parts = fieldName.trim().split(".");
    const r = {};
    let current = r;

    parts.forEach((part, index) => {
        if(index === parts.length - 1) {
            current[part] = null;
        } else {
            current = current[part] = {};
        }
    });

    return r;
}


function _mergeAtLevel(dest, src) {

    Object.keys(src).forEach(key => {

        if(dest.hasOwnProperty(key)) {
            if(dest[key] !== null) {
                if(src[key] !== null) {
                    _mergeAtLevel(dest[key], src[key]);
                }
            } else {
                dest[key] = src[key];
            }
        } else {
            dest[key] = src[key];
        }
    });

    return dest;
}

function mergeFetchFields(destFields, srcFields) {

    if(!srcFields) {
        return destFields;
    }
    return _mergeAtLevel(destFields, srcFields);
}

function fetchFieldsToGraphQL(fields, indent = '    ') {

    return Object.keys(fields).map(f => {
        const v = fields[f];
        if(v === null) {
            return `${indent}${f}`;
        }
        return `${indent}${f} {\n${fetchFieldsToGraphQL(v, indent + indent)}\n${indent}}`;
    }).join("\n");
}


export { mergeFetchFields, fetchFieldsToGraphQL, bindingToFetchFields };