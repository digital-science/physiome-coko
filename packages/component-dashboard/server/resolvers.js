const WorkflowModel = require('component-workflow-model/model');
const { Submission } = WorkflowModel.models;

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

            return true;
        },

        restartRejectedSubmission: async (instance, args, context, info) => {

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

            submission.phase = "submitted";
            await submission.save();

            return !!(await Submission.instanceResolver.restart(submission, "StartEvent_ResumeRejected"));
        }
    }
};