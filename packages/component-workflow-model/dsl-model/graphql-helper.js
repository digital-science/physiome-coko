const Model = require('client-workflow-model/Model');

const TypeListingRestriction = {
    All: 'all',
    Input: 'input',
    Listing: 'listing',
    State: 'state'
};


class GraphQLHelper {

    static get Tab() {
        return '    ';
    }

    static get TypeListingRestriction() {
        return TypeListingRestriction;
    }


    // Given a listing of fields, we want to convert these into GraphQL field name to type pairings.
    // We can also apply some restrictions at the same time, ensuring only inputs are allowed, or only listing related
    // fields are considered.

    static gqlTypeListingForFields(fields, workflowDescription, restriction = TypeListingRestriction.All) {

        const inputFilter = restriction === TypeListingRestriction.Input;
        const listingFilter = restriction === TypeListingRestriction.Listing;
        const stateFilter = restriction === TypeListingRestriction.Listing;
        const filteredElements = inputFilter ? Model.filterFieldsForBasicTypes(fields, workflowDescription.enums) : (stateFilter ? Model.filterFieldsForStateFields(fields) : fields);

        return filteredElements.map(e => {

            if(inputFilter && e.hasOwnProperty('input') && e.input === false) {
                return null;
            }

            const type = (e.type === "File" && (e.fileLabels === true || e.fileTypes === true)) ? "ExtendedFile" : e.type;

            if(e.array || (listingFilter && e.listingFilterMultiple === true)) {
                if(inputFilter && e.input !== true) {
                    return null;
                }
                return `${e.field}: [${type}]`;
            }

            return `${e.field}: ${type}`;

        }).filter(v => !!v);
    }
}


module.exports = GraphQLHelper;