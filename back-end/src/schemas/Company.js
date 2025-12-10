const { z } = require('zod');

const companySchema = z.object({
  id: z.number(),
  name: z.string(),
  address: z.string().nullable(),
});

module.exports = companySchema;