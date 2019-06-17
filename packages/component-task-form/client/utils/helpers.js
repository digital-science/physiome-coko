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

    let nextId = nextUniqueIdInArray(array, idField);
    array.forEach(a => {
        if(!a.hasOwnProperty(idField)) {
            a[idField] = nextId;
            ++nextId;
        }
    });
    return array;
}

export { nextUniqueIdInArray, assignUniqueIdsToArrayItems };
