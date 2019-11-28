const request = require('request');
const config = require('config');
const { eachLimit } = require('async');

const PublicORCIDEndpoint = config.get('orcid.publicApiEndpoint');

const MaxConcurrentResolves = 5;


async function resolveORCIDPersonDetails(orcidIdList) {


    return new Promise((resolve, reject) => {

        const results = [];

        eachLimit(orcidIdList, MaxConcurrentResolves, function(orcidId, callback) {

            resolveORCIDDetails(orcidId).then(r => {
                results.push(r);
                callback();
            }).catch(err => {
                callback(err);
            });

        }, function(err) {

            return resolve(results);
        });
    });
}

async function resolveORCIDDetails(orcidId) {

    const requestUrl = `${PublicORCIDEndpoint}/v3.0/${encodeURI(orcidId)}/person`;
    const options = {
        headers: {
            Accept: "application/json"
        },
        json: true
    };

    return new Promise((resolve, reject) => {

        request(requestUrl, options, function(err, response, body) {

            if(err) {
                return reject(err);
            }

            if(body && body.name) {

                return resolve({
                    orcidId,
                    givenNames: _safeGetValue(body.name, 'given-names'),
                    familyNames: _safeGetValue(body.name, 'family-name')
                });
            }
            return resolve(null);
        });
    });
}

function _safeGetValue(orcidName, key) {
    const v = orcidName && orcidName.hasOwnProperty(key) && orcidName[key].value ? orcidName[key].value : null;
    return v && v instanceof Array ? v.join(" ") : v;
}


module.exports = {
    Query: {
        resolveORCIDPersonDetails: async (instance, { ids }, context, info) => {
            return resolveORCIDPersonDetails(ids);
        }
    }
};