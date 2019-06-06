const Joi = require('joi')

module.exports = {
  collection: {
    // project
    collectionType: Joi.string(),
    created: Joi.date(),
    title: Joi.string(),
    status: Joi.string(),
    visibleStatus: Joi.string(),
    customId: Joi.string(),
    invitations: Joi.array(),
    handlingEditor: Joi.object(),
    technicalChecks: Joi.object({
      token: Joi.string(),
      eqa: Joi.boolean(),
    }),
  },
  fragment: [
    {
      fragmentType: Joi.valid('version').required(),
      collectionId: Joi.string().required(),
      created: Joi.date(),
      version: Joi.number(),
      submitted: Joi.date(),
      source: Joi.string(), // TODO: move to a file
      meta: Joi.object({
        journal: Joi.string(),
        issue: Joi.string(),
        title: Joi.string(),
        abstract: Joi.string(),
        type: Joi.string(),
        agreeTc: Joi.any(),
        conflicts: Joi.object({
          hasConflicts: Joi.any().valid(['yes', 'no']),
          message: Joi.string().allow(''),
          hasDataAvailability: Joi.any().valid(['yes', 'no', '']),
          dataAvailabilityMessage: Joi.string().allow(''),
          hasFunding: Joi.any().valid(['yes', 'no', '']),
          fundingMessage: Joi.string().allow(''),
        }),
      }),
      responseToReviewers: Joi.object({
        file: Joi.object({
          id: Joi.string(),
          name: Joi.string().required(),
          originalName: Joi.string(),
          type: Joi.string(),
          size: Joi.number(),
          url: Joi.string(),
          signedUrl: Joi.string(),
        }).allow(null),
        content: Joi.string().allow(''),
      }),
      files: Joi.object({
        manuscript: Joi.any(),
        manuscripts: Joi.array().items(
          Joi.object({
            id: Joi.string(),
            name: Joi.string().required(),
            originalName: Joi.string(),
            type: Joi.string(),
            size: Joi.number(),
            url: Joi.string(),
            signedUrl: Joi.string(),
          }),
        ),
        supplementary: Joi.array().items(
          Joi.object({
            id: Joi.string(),
            name: Joi.string().required(),
            originalName: Joi.string(),
            type: Joi.string(),
            size: Joi.number(),
            url: Joi.string(),
            signedUrl: Joi.string(),
          }),
        ),
        coverLetter: Joi.array().items(
          Joi.object({
            id: Joi.string(),
            name: Joi.string().required(),
            originalName: Joi.string(),
            type: Joi.string(),
            size: Joi.number(),
            url: Joi.string(),
            signedUrl: Joi.string(),
          }),
        ),
        responseToReviewers: Joi.array().items(
          Joi.object({
            id: Joi.string(),
            name: Joi.string().required(),
            originalName: Joi.string(),
            type: Joi.string(),
            size: Joi.number(),
            url: Joi.string(),
            signedUrl: Joi.string(),
            submittedOn: Joi.date(),
          }),
        ),
      }),
      notes: Joi.object({
        fundingAcknowledgement: Joi.string(),
        specialInstructions: Joi.string(),
      }),
      reviewers: Joi.array(),
      lock: Joi.object(),
      decision: Joi.object(),
      authors: Joi.array(),
      invitations: Joi.array(),
      revision: Joi.any(),
      recommendations: Joi.array().items(
        Joi.object({
          id: Joi.string().required(),
          userId: Joi.string().required(),
          recommendationType: Joi.string()
            .valid(['review', 'editorRecommendation'])
            .required(),
          submittedOn: Joi.date(),
          createdOn: Joi.date(),
          updatedOn: Joi.date(),
          recommendation: Joi.string().valid([
            'reject',
            'publish',
            'revise',
            'revision',
            'major',
            'minor',
            'return-to-handling-editor',
          ]),
          comments: Joi.array().items(
            Joi.object({
              content: Joi.string(),
              public: Joi.boolean(),
              files: Joi.array(),
            }),
          ),
        }),
      ),
    },
  ],
  user: {
    orcid: Joi.object(),
    name: Joi.string(),
    username: Joi.string(),
    title: Joi.string().allow(''),
    agreeTC: Joi.boolean(),
    isActive: Joi.boolean(),
    firstName: Joi.string().allow(''),
    lastName: Joi.string().allow(''),
    affiliation: Joi.string().allow(''),
    isConfirmed: Joi.boolean(),
    editorInChief: Joi.boolean(),
    country: Joi.string().allow(''),
    teams: Joi.array(),
    handlingEditor: Joi.boolean(),
    passwordHash: Joi.string(),
    notifications: Joi.object({
      email: Joi.object({
        system: Joi.boolean().default(true),
        user: Joi.boolean().default(true),
      }),
    }),
    accessTokens: Joi.object({
      confirmation: Joi.string().allow(''),
      passwordReset: Joi.string().allow(''),
      unsubscribe: Joi.string().allow(''),
      invitation: Joi.string().allow(null),
    }),
  },
  team: {
    name: Joi.string(),
    type: Joi.string(),
    group: Joi.string(),
    teamType: Joi.object(),
  },
}
