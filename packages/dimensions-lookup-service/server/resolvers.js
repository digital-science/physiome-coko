const logger = require("@pubsweet/logger");


function GrantsForProjectNumber(dimensionsApi, projectNumber) {

    const q = `search grants where project_num~"${projectNumber.replace('"', `\\"`)}" return grants[basics + linkout] sort by relevance limit 20`;

    return dimensionsApi.query(q).then(result => {

        if(!result || !result.grants) {
            return [];
        }

        return result.grants.map(grant => {
            return {
                id:grant.id,
                title:grant.title,
                projectNumber:grant.project_num,
                startYear:grant.start_year,
                funders:grant.funders,
                link:grant.linkout
            };
        });
    });
}


module.exports = (dimensionsApi) => {

    return {
        Query: {

            grantsForProjectNumber: (ctxt, input, context, info) => {

                const { projectNumber } = input;

                // FIXME: check for user auth, shouldn't be a public API endpoint

                return GrantsForProjectNumber(dimensionsApi, projectNumber).catch(err => {
                    logger.error(`[DimenionsLookupService/GrantsForProjectNumber] lookup failed due to: ${err.toString()}`);
                    throw new Error("Server error");
                });
            }

        }
    }
};