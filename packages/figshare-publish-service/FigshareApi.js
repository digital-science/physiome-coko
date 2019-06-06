const Request = require('request');
const logger = require('@pubsweet/logger');

const FigshareApiEndpoints = {

    CreateArticle: "account/articles",
    UpdateArticle: (id) => { return `account/articles/${encodeURI(id)}` },
    PublishArticle: (id) => { return `account/articles/${encodeURI(id)}/publish` },

    InitiateFileUpload: (id) => { return `account/articles/${encodeURI(id)}/files` },
    CompleteFileUpload: (id, fileInfo) =>  { return `account/articles/${encodeURI(id)}/files/${encodeURI(fileInfo.id)}` },
    ArticleFilesListing: (id) => { return `account/articles/${encodeURI(id)}/files` },
    DeleteFile: (id, fileInfo) => { return `account/articles/${encodeURI(id)}/files/${encodeURI(fileInfo.id)}`; },

    UploadFilePart: (fileInfo, partNo) => { return `${fileInfo.upload_url}/${partNo}` }
};


class FigshareApi {

    constructor(apiBaseUrl, apiToken) {
        this.apiBaseUrl = apiBaseUrl;
        this.apiToken = apiToken;
    }

    createNewArticle(articleData) {

        return this._performPostRequest(FigshareApiEndpoints.CreateArticle, articleData).then((r) => {
            return r.location;
        }).then((location) => {
            return this._performGetRequest(location);
        }).then((r) => {
            return r.id;
        });
    }

    updateArticle(articleID, articleData) {

        return this._performPutRequest(FigshareApiEndpoints.UpdateArticle(articleID), articleData);
    }

    publishArticle(articleID) {

        return this._performPostRequest(FigshareApiEndpoints.PublishArticle(articleID));
    }

    getArticleFileListing(articleID) {

        return this._performGetRequest(FigshareApiEndpoints.ArticleFilesListing(articleID));
    }

    initiateFileUpload(articleID, fileName, fileSize, md5) {

        const initiateURL = FigshareApiEndpoints.InitiateFileUpload(articleID);
        const data = {
            md5: md5,
            name: fileName,
            size: fileSize
        };

        return this._performPostRequest(initiateURL, data).then((r) => {

            return r.location;

        }).then((location) => {

            return this._performGetRequest(location);

        }).then((fileInfo) => {

            return this._performGetRequest(fileInfo.upload_url).then(uploadInfo => {
                return {fileInfo, uploadInfo};
            });
        });
    }

    uploadFilePart(articleID, fileInfo, part, data=null) {

        // Note: returns a request object, allowing a stream of data for the part to be piped to the PUT response
        if(!data) {
            return this._performPipeablePutRequest(FigshareApiEndpoints.UploadFilePart(fileInfo, part.partNo), null, false);
        }

        return this._performPutRequest(FigshareApiEndpoints.UploadFilePart(fileInfo, part.partNo), data, false);
    }

    completeFileUpload(articleID, fileInfo) {

        return this._performPostRequest(FigshareApiEndpoints.CompleteFileUpload(articleID, fileInfo));
    }

    deleteFile(articleID, fileInfo) {

        return this._performDeleteRequest(FigshareApiEndpoints.DeleteFile(articleID, fileInfo));
    }



    _performGetRequest() {
        return this._performRequest("GET", ...arguments);
    };

    _performPostRequest() {
        return this._performRequest("POST", ...arguments);
    }

    _performPutRequest() {
        return this._performRequest("PUT", ...arguments);
    }

    _performDeleteRequest() {
        return this._performRequest("DELETE", ...arguments);
    }

    _performPipeablePutRequest() {
        return this._performPipeableRequest("PUT", ...arguments);
    };

    _performRequest(method, endpoint, body, json=true, qs=null) {

        const headers = {Authorization: `token ${this.apiToken}`};
        const options = {
            uri: endpoint,
            method: (method || "GET"),
            headers: headers
        };

        if(endpoint.toLowerCase().indexOf(this.apiBaseUrl.toLowerCase()) === -1 && !endpoint.match(/^https?:\/\//i) ) {
            options.baseUrl = this.apiBaseUrl;
        }

        if(json) {
            options.json = true;
        }

        if(body) {
            options.body = body;
        }

        if(qs) {
            options.qs = qs;
        }

        return new Promise(function(resolve, reject) {

            Request(options, function(err, response, responseBody) {
                if(err) {
                    return reject(err);
                }

                if(response.statusCode >= 400) {
                    logger.debug(`[figshare-publish-service] FigshareAPI request returned an invalid response code ${response.statusCode} for request [${method || "GET"} -> ${endpoint}]
                        \trequest-body: ${body ? JSON.stringify(body, null, 4) : "<none>"}
                        \tresponse-body: ${responseBody ? JSON.stringify(responseBody, null, 4) : "<none>"}`);
                    return reject(new Error(`Invalid response code (${response.statusCode}) returned from figshare API endpoint`));
                }

                return resolve(responseBody);
            });
        });
    };

    _performPipeableRequest(method, endpoint, body=null, json=true, qs=null) {

        const headers = {Authorization: `token ${this.apiToken}`};
        const options = {
            uri: endpoint,
            method: (method || "GET"),
            headers: headers
        };

        if(endpoint.toLowerCase().indexOf(this.apiBaseUrl.toLowerCase()) === -1 && !endpoint.match(/^https?:\/\//i) ) {
            options.baseUrl = this.apiBaseUrl;
        }

        if(json) {
            options.json = true;
        }

        if(body) {
            options.body = body;
        }

        if(qs) {
            options.qs = qs;
        }

        return Request(options);
    };
}


module.exports = FigshareApi;