const TaskEmailInitialSubmission = require('./task-email-initial-submission');
const TaskPublishArticle = require('./task-publish-article');

const AllTaskSetups = [TaskEmailInitialSubmission, TaskPublishArticle];

module.exports = function initExternalTasks(client) {
    return Promise.all(AllTaskSetups.map(taskSetup => taskSetup(client)));
};
