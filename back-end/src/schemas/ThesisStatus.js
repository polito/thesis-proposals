const { z } = require('zod');

const thesisStatusSchema = z
  .enum(['ongoing', 'conclusion_requested', 'conclusion_approved', 'conclusion_rejected'])
  .transform(status => status);

module.exports = thesisStatusSchema;
