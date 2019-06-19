function deepRemoveKeys(object, key) {

    if(object === null || object === undefined) {
        return;
    }

    if(object instanceof Array) {
        return object.forEach(value => deepRemoveKeys(value, key));
    }

    if(typeof object === "object") {
        delete object[key];
        Object.values(object).forEach(value => deepRemoveKeys(value, key));
    }
}

export { deepRemoveKeys };