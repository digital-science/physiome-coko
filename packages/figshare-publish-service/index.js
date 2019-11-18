const config = require('config');
const {FigshareApi, NotFoundError} = require('./FigshareApi');

const fc = config.get('figshare');

exports.FigshareApi = new FigshareApi(fc.apiBaseUrl, fc.apiToken);
exports.NotFoundError = NotFoundError;