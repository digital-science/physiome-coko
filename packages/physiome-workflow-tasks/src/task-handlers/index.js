const TaskEmailManuscriptAcceptance = require('./task-email-acceptance');
const TaskEmailManuscriptInitialSubmission = require('./task-email-initial-submission');
const TaskEmailManuscriptPaymentReceived = require('./task-email-payment-received');
const TaskEmailManuscriptPublished = require('./task-email-published');
const TaskEmailManuscriptRejection = require('./task-email-rejection');
const TaskEmailDecisionRequired = require('./task-email-decision-required');

const TaskPublishArticle = require('./task-publish-article');
const TaskRepublishArticle = require('./task-republish-article');
const TaskReserveDoi = require('./task-reserve-doi');
const TaskRejectionCleanup = require('./task-rejection-cleanup');

const TaskTimeoutSubmission = require('./task-time-out-submission');


const AllTaskSetups = [
    TaskEmailManuscriptAcceptance,
    TaskEmailManuscriptInitialSubmission,
    TaskEmailManuscriptPaymentReceived,
    TaskEmailManuscriptPublished,
    TaskEmailManuscriptRejection,
    TaskEmailDecisionRequired,
    TaskPublishArticle,
    TaskRepublishArticle,
    TaskReserveDoi,
    TaskRejectionCleanup,
    TaskTimeoutSubmission
];


module.exports = function initExternalTasks(client) {
    return Promise.all(AllTaskSetups.map(taskSetup => taskSetup(client)));
};