const TaskEmailInitialSubmission = require('./task-email-initial-submission');
const TaskEmailManuscriptAcceptance = require('./task-email-acceptance');
const TaskEmailManuscriptRejection = require('./task-email-rejection');

const TaskPublishArticle = require('./task-publish-article');

const AllTaskSetups = [TaskEmailInitialSubmission, TaskEmailManuscriptAcceptance, TaskEmailManuscriptRejection, TaskPublishArticle];

module.exports = function initExternalTasks(client) {
    return Promise.all(AllTaskSetups.map(taskSetup => taskSetup(client)));
};
