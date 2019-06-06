const config = require('config');
const FigshareApi = require('./FigshareApi');

const fc = config.get('figshare');

exports.FigshareApi = new FigshareApi(fc.apiBaseUrl, fc.apiToken);