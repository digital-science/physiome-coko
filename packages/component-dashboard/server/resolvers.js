
// NOTE: this is implemented this way currently for development purposes, it will be changhed into a more generic
// approach (fetching arbitrary collections of model objects).

const WorkflowModel = require('component-workflow-model/model');
const { Submission } = WorkflowModel.models;


module.exports = {

    Query: {

        // FIXME: limiting will need to be applied etc

        submissions: (instance, args, context, info) => {

            const { active=false } = args;

            return active ?
                Submission.query().where(builder => builder.whereNot('phase', 'cancelled').orWhereNull('phase')).orderBy('submissionDate')
                : Submission.query().where('phase', 'published').orderBy('submissionDate');
        }
    },

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