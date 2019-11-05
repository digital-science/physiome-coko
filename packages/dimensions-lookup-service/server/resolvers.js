const { AuthorizationError } = require('@pubsweet/errors');
const logger = require("@pubsweet/logger");
const URL = require("url");
const _ = require("lodash");

const { resolveUserForContext } = require('../shared-helpers/access');


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


function JournalsMatchingName(dimensionsApi, journalName) {

    const q = `search publications where journal.title~"${journalName.replace('"', `\\"`)}" return journal limit 20`;

    return dimensionsApi.query(q).then(result => {

        if(!result || !result.grants) {
            return [];
        }

        return result.journal.map(j => {
            return {
                id:j.id,
                title:j.title,
            };
        });
    });
}


function _cleanedDoi(doi) {

    const parsedDoi = URL.parse(doi);
    if(!parsedDoi) {
        return doi;
    }

    if(parsedDoi.pathname && parsedDoi.pathname.length > 1) {
        return parsedDoi.pathname.replace(/^\//, "");
    }

    return doi;
}

function _mapAuthors(authorsList) {

    const r = [];

    authorsList.forEach(a => {
        if(a instanceof Array) {
            const list = _mapAuthors(a);
            if(list && list.length) {
                r.push.apply(r, list);
            }
        } else {
            const author = _mapAuthor(a);
            if(author) {
                r.push(author);
            }
        }
    });

    return r.length ? r : null;
}

function _mapAuthor(src) {

    const author = {id:src.researcher_id, researcherId:src.researcher_id};

    if(src.first_name) {
        author.firstName = src.first_name;
    }

    if(src.last_name) {
        author.lastName = src.last_name;
    }

    return author;
}


function DOIInfoLookup(dimensionsApi, doi) {

    const cleanedDoi = _cleanedDoi(doi);

    const q = `search publications where doi="${cleanedDoi.replace('"', '\\"')}" return publications[basics + doi + pmcid + pmid + linkout] limit 1`;

    return dimensionsApi.query(q).then(result => {

        if(!result || !result.publications || !result.publications.length) {
            return null;
        }

        const pub = result.publications[0];
        const r = {id:pub.id};

        Object.assign(r, _.pick(pub, ['title', 'volume', 'issue', 'pages', 'year', 'pmid', 'pmcid', 'type', 'doi']));

        if(pub.linkout) {
            r.link = pub.linkout;
        }

        if(pub.author_affiliations) {
            const authors = _mapAuthors(pub.author_affiliations);
            if(authors) {
                r.authors = authors;
            }
        }

        return r;
    });
}


module.exports = (dimensionsApi) => {

    return {
        Query: {

            grantsForProjectNumber: async (ctxt, { projectNumber }, context, info) => {

                const user = await resolveUserForContext(context);
                if(!user) {
                    return new AuthorizationError(`Valid user required for lookup.`);
                }

                return GrantsForProjectNumber(dimensionsApi, projectNumber).catch(err => {
                    logger.error(`[DimenionsLookupService/GrantsForProjectNumber] lookup failed due to: ${err.toString()}`);
                    throw new Error("Server error");
                });
            },

            detailsForDOI: async (ctxt, { doi }, context, info) => {

                const user = await resolveUserForContext(context);
                if(!user) {
                    return new AuthorizationError(`Valid user required for lookup.`);
                }

                return DOIInfoLookup(dimensionsApi, doi).catch(err => {
                    logger.error(`[DimenionsLookupService/DetailsForDOI] lookup failed due to: ${err.toString()}`);
                    throw new Error("Server error");
                });
            }

        }
    }
};