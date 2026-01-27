const { z } = require('zod');

const thesisStatusSchema = z.enum(['ongoing', 'conclusion_requested', 'conclusion_approved', 'conclusion_rejected']);

module.exports = thesisStatusSchema;
