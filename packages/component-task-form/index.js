module.exports = {};

const { registerConditionFunction } = require('client-workflow-model/ConditionFunctions');
const { correspondingAuthors, validCitations, validIdentity } = require('./shared/validations');

registerConditionFunction('correspondingAuthors', correspondingAuthors);
registerConditionFunction('validCitations', validCitations);
registerConditionFunction('validIdentity', validIdentity);