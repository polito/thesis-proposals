const { z } = require('zod');

const teacherSchema = require('./Teacher');
const companySchema = require('./Company');
const thesisApplicationStatusSchema = require('./ThesisApplicationStatus');


const thesisApplicationResponseSchema = z.object({
    id: z.number(),
    topic: z.string(),
    supervisor: z.object(teacherSchema),
    coSupervisors: z.array(teacherSchema).default([]).nullable(),
    company: z.object(companySchema).nullable(),
    submissionDate: z.string().datetime(),
    status: thesisApplicationStatusSchema,
})
.transform((response) => ({
    id: response.id,
    topic: response.topic,
    supervisor: response.supervisor,
    coSupervisors: response.coSupervisors,
    company: response.company,
    submissionDate: response.submissionDate,
    status: response.status,
}));

module.exports = thesisApplicationResponseSchema;
