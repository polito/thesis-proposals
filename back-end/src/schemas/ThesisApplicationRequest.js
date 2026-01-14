const { z } = require('zod');

const teacherOverviewSchema = require('./TeacherOverview');
const thesisProposalOverviewSchema = require('./ThesisProposalOverview');
const studentSchema = require('./Student');

const thesisApplicationRequestSchema = z.object({
    topic: z.string(),
    student: z.object(studentSchema),
    supervisor: z.object(teacherOverviewSchema),
    coSupervisors: z.array(teacherOverviewSchema).default([]).nullable(),
    companyId: z.number().nullable(),
    thesisProposal: z.object(thesisProposalOverviewSchema).nullable(),
});

module.exports = thesisApplicationRequestSchema;
