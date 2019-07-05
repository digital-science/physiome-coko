const { Identity } = require('component-workflow-model/shared-model/identity');


function _buildTextQuery() {

    return `to_tsquery(regexp_replace(cast(plainto_tsquery(?) as text), E'(\\'\\\\w+\\')', E'\\\\1:*', 'g'))`;
}

function modifyListingQuery(query, modelClass, input, topLevelFields, topLevelRelationFields) {

    if(!input.searchText) {
        return null;
    }

    const knex = modelClass.knex();
    const tableName = modelClass.tableName;
    const identityTableName = Identity.tableName;

    return query.andWhere(builder => {

        return builder.whereIn('id', builder => {

            // Search the title
            return builder.select('id').from(tableName).where(knex.raw(`to_tsvector('english', title) @@ ${_buildTextQuery()}`, [input.searchText])).union(

                // Search on manuscript ID
                knex.select('id').from(tableName).where('manuscriptId', input.searchText.replace(/\s+/g, '').toUpperCase()),

                // Search the author names
                knex.select('id').from(tableName).where(knex.raw(`submission_authors_names_to_tsvector(authors) @@ ${_buildTextQuery()}`, [input.searchText])),

                // Search the submitter name
                knex.select(knex.raw(`${tableName}.id as id`)).from(identityTableName).where(knex.raw(`to_tsvector('english', ${identityTableName}.display_name) @@ ${_buildTextQuery()}`, [input.searchText]))
                    .leftJoin(tableName, builder => {
                        return builder.on(`${tableName}.submitterId`, '=', `${identityTableName}.id`);
                    })
            );
        });
    });
}

//to_tsvector('english', display_name)


function modifyListingParameters(parameters, taskDef, enums) {

    parameters.push('searchText: String');
    return null;
}

function modifyListingFilterQueryForField(query, field, value, modelClass, filter) {

    return null;
}

function modifyListingFilterQuery(query, modelClass, filter) {

    //searchText
    return null;
}




module.exports = {
    modifyListingQuery,
    modifyListingParameters,

    modifyListingFilterQuery,
    modifyListingFilterQueryForField
};