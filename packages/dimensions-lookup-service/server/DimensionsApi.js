const request = require("request");


function DimensionsApi(baseUrl, username, password) {

    this.baseUrl = baseUrl;
    this.username = username;
    this.password = password;

    this._currentResolver = null;
    this._cachedAuthToken = null;
}

DimensionsApi.prototype._resolveAuthToken = function() {

    if(this._cachedAuthToken) {
        return Promise.resolve(this._cachedAuthToken);
    }

    if(this._currentResolver) {
        return this._currentResolver;
    }

    const resolver = this._currentResolver = new Promise((resolve, reject) => {

        const opts = {};

        opts.url = this.baseUrl + "/auth.json";
        opts.json = true;
        opts.method = "POST";
        opts.body = {
            username: this.username,
            password: this.password
        };

        request(opts, (err, response, body) => {

            if(resolver === this._currentResolver) {
                this._currentResolver = null;
            }

            if(err) {
                return reject(err);
            }
            if(response.statusCode !== 200) {
                return reject(new Error("Dimensions request auth token failed with status code: " + response.statusCode));
            }

            this._cachedAuthToken = body.token;
            return resolve(body.token);
        });
    });

    return resolver;
};


DimensionsApi.prototype.query = function(query) {

    const baseUrl = this.baseUrl;

    const perform = function _performQuery(token) {

        const opts = {};
        opts.url = baseUrl + "/dsl.json";
        opts.headers = {Authorization: `JWT ${token}`};
        opts.method = "POST";
        opts.body = query;

        return new Promise(function(resolve, reject) {

            request(opts, function(err, response, body) {

                if(err) {
                    return reject(err);
                }

                if(response.statusCode < 200 || response.statusCode >= 300) {
                    if(response.statusCode === 401) {
                        const e = new Error("Dimensions request, not authorised.");
                        e.unauthorisedError = true;
                        return reject(e);
                    }

                    return reject(new Error("Dimensions query request failed with status code: " + response.statusCode));
                }

                let r = null;
                try {
                    r = JSON.parse(body);
                } catch(e) {
                    return reject(new Error("JSON parsing issue with Dimensions query: " + e.toString()));
                }

                return resolve(r);
            });
        });
    };

    return this._resolveAuthToken().then(token => {

        return perform(token);

    }).catch((err) => {

        if(err.unauthorisedError) {
            this._cachedAuthToken = null;

            return this._resolveAuthToken().then(token => {
                return perform(token);
            });
        }

        throw err;
    });
};


module.exports = DimensionsApi;