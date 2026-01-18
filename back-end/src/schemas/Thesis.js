const { z } = require('zod');

const studentSchema = require('./Student');
const companySchema = require('./Company');
const teacherSchema = require('./Teacher');

const thesisSchema = z.object({
    id: z.number(),
    topic: z.string(),
    student: studentSchema,
    supervisor: teacherSchema,
    coSupervisors: z.array(teacherSchema).default([]).nullable(),
    company: companySchema.nullable(),
    thesisApplicationDate: z.string().datetime(),
    thesisConclusionRequestDate: z.string().datetime().nullable(),
    thesisConclusionConfirmationDate: z.string().datetime().nullable(),
})
.transform((thesis) => ({
    id: thesis.id,
    topic: thesis.topic,
    student: thesis.student,
    supervisor: thesis.supervisor,
    coSupervisors: thesis.coSupervisors,
    company: thesis.company,
    thesisApplicationDate: thesis.thesisApplicationDate,
    thesisConclusionRequestDate: thesis.thesisConclusionRequestDate,
    thesisConclusionConfirmationDate: thesis.thesisConclusionConfirmationDate,
}));

module.exports = thesisSchema;