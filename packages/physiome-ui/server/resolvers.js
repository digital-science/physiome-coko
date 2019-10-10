const WorkflowModel = require('component-workflow-model/model');
const { Submission } = WorkflowModel.models;

const logger = require('workflow-utils/logger-with-prefix')('dashboard/server');

module.exports = {

    Mutation: {

        claimSubmission: async (instance, args, context, info) => {

            // FIXME: apply ACL security checks onto this request to modify a submission

            const userId = context.user;
            if(!userId) {
                return false;
            }

            const submissionId = args.id;
            if(!submissionId) {
                return false;
            }

            const submission = await Submission.find(submissionId);
            if(!submission) {
                return false;
            }

            submission.curatorId = userId;
            await submission.save();
            await submission.publishWasModified();

            return true;
        },

        unclaimSubmission: async (instance, args, context, info) => {

            // FIXME: apply ACL security checks onto this request to modify a submission

            const userId = context.user;
            if(!userId) {
                return false;
            }

            const submissionId = args.id;
            if(!submissionId) {
                return false;
            }

            const submission = await Submission.find(submissionId);
            if(!submission) {
                return false;
            }

            if(submission.curatorId === userId) {

                submission.curatorId = null;
                await submission.save();
                await submission.publishWasModified();
            }

            return true;
        },

        restartRejectedSubmission: async (instance, args, context, info) => {

            // FIXME: apply ACL security checks onto this request (to modify a submission)

            const userId = context.user;
            if(!userId) {
                return false;
            }

            const submissionId = args.id;
            if(!submissionId) {
                return false;
            }

            const submission = await Submission.find(submissionId);
            if(!submission) {
                return false;
            }

            if(submission.phase !== "reject") {
                logger.warn(`unable to resume rejected submission as phase isn't currently marked as being rejected {submissionId = ${submissionId}`);
                return false;
            }

            submission.phase = "submitted";
            await submission.save();

            return !!(await submission.restartWorkflow("StartEvent_ResumeRejected"));
        },

        republishSubmission: async (instance, args, context, info) => {

            // FIXME: apply ACL security checks onto this request (to modify a submission)

            const userId = context.user;
            if(!userId) {
                return false;
            }

            const submissionId = args.id;
            if(!submissionId) {
                return false;
            }

            const submission = await Submission.find(submissionId);
            if(!submission) {
                return false;
            }

            if(submission.phase !== "published") {
                logger.warn(`unable to republish submission as phase isn't currently marked as being published {submissionId = ${submissionId}`);
                return false;
            }

            submission.phase = "publish";
            await submission.save();

            return !!(await submission.restartWorkflow("StartEvent_RepublishArticle"));
        }
    }
};