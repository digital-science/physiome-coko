const WorkflowModel = require('component-workflow-model/model');
const { Submission } = WorkflowModel.models;

module.exports = {

    Mutation: {

        claimSubmission: async (instance, args, context, info) => {

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
        }
    }
};