const Joi = require('joi')

module.exports = {
  manuscripts: Joi.any()
    .valid([
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/pdf',
      'application/msword',
      'application/vnd.oasis.opendocument.text',
      'text/plain',
      'application/rdf+xml',
    ])
    .error(new Error('Document type is not allowed.')),
  supplementary: Joi.any(),
  coverLetter: Joi.any()
    .valid([
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/pdf',
      'application/msword',
      'application/vnd.oasis.opendocument.text',
      'text/plain',
      'application/rdf+xml',
    ])
    .error(new Error('Document type is not allowed.')),
  responseToReviewers: Joi.any()
    .valid([
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/pdf',
      'application/msword',
      'application/vnd.oasis.opendocument.text',
      'text/plain',
      'application/rdf+xml',
    ])
    .error(new Error('Document type is not allowed.')),
  review: Joi.any(),
}
