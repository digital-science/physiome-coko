const TaskEmailInitialSubmission = require('./task-email-initial-submission');
const TaskEmailManuscriptAcceptance = require('./task-email-acceptance');
const TaskEmailManuscriptRejection = require('./task-email-rejection');

const TaskPublishArticle = require('./task-publish-article');
const TaskReserveDoi = require('./task-reserve-doi');

const TaskTimeoutSubmission = require('./task-time-out-submission');


const AllTaskSetups = [TaskEmailInitialSubmission, TaskEmailManuscriptAcceptance, TaskEmailManuscriptRejection,
    TaskPublishArticle, TaskReserveDoi, TaskTimeoutSubmission];


module.exports = function initExternalTasks(client) {
    return Promise.all(AllTaskSetups.map(taskSetup => taskSetup(client)));
};