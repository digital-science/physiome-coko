module.exports = {};

const { registerConditionFunction } = require('client-workflow-model/ConditionFunctions');
const { correspondingAuthors, validCitations, validIdentity, validUri, fileCount } = require('./shared/validations');

registerConditionFunction('correspondingAuthors', correspondingAuthors);
registerConditionFunction('validCitations', validCitations);
registerConditionFunction('validIdentity', validIdentity);
registerConditionFunction('validUri', validUri);
registerConditionFunction('fileCount', fileCount);

