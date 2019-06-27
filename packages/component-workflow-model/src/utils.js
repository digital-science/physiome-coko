exports.mergeResolvers = function _mergeResolvers(target, source) {

    if(!source) {
        return target;
    }

    Object.keys(source).forEach(key => {
        const dest = target[key] || {};
        Object.assign(dest, source[key]);
        target[key] = dest;
    });

    return target;
};



// FIXME: this should be more generalised into a generic lookup table or something of that sort of nature (this current impl smells a little)
const BaseElementTypes = ['String', 'Integer', 'ID', 'DateTime', 'Boolean', 'JSON'];


exports.filterModelElementsForRelations = function _filterModelElementsForRelations(elements, enums) {

    return elements.filter(element => {

        if(BaseElementTypes.indexOf(element.type) !== -1) {
            return false;
        }
        return !enums.hasOwnProperty(element.type);
    });
};


exports.filterModelElementsForBasicTypes = function _filterModelElementsForRelations(elements, enums) {

    return elements.filter(element => {
        return (BaseElementTypes.indexOf(element.type) !== -1 || enums.hasOwnProperty(element.type));
    });
};



exports.filterModelElementsForStates = function _filterModelElementsForStates(elements, enums) {

    return elements.filter(element => {
        return (element.state === true);
    });
};


exports.filterModelElementsForListingFilters = function _filterModelElementsForListingFilters(elements, enums) {

    return elements.filter(element => {
        return (element.listingFilter === true);
    });
};


exports.filterModelElementsForListingSortable = function _filterModelElementsForListingFilters(elements, enums) {

    return elements.filter(element => {
        return (element.listingSorting === true);
    });
};


exports.filterModelElementsForOwnerFields = function _filterModelElementsForOwnerIdFields(elements) {

    return elements.filter(element => {
        return (element.holdsOwnerId === true && element.type === "Identity" && element.joinField);
    });
};


exports.filterModelElementsForIdSequenceFields = function _filterModelElementsForIdSequenceFields(elements) {

    return elements.filter(element => {
        return (element.idSequence);
    });
};






function lowerCaseFirstLetter(string) {
    return string.charAt(0).toLowerCase() + string.slice(1);
}


exports.listingAccessorNameForTaskDefinition = function(taskDef) {

    return (taskDef.options && taskDef.options.listingAccessor) ? taskDef.options.listingAccessor : `${lowerCaseFirstLetter(taskDef.name)}s`;

};