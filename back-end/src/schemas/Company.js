const { z } = require('zod');

const companySchema = z.object({
  id: z.number(),
  corporateName: z.string(),
  registeredOffice: z.object({
    street: z.string(),
    city: z.string(),
    postalCode: z.string().nullable(),
    stateOrProvince: z.string().nullable(),
    country: z.string(),
  }).nullable(),
})
.transform((company) => ({
  id: company.id,
  corporateName: company.corporateName,
  registeredOffice: company.registeredOffice,
}));

module.exports = companySchema;