const { z } = require('zod');

const studentSchema = require('./Student');
const companySchema = require('./Company');
const teacherSchema = require('./Teacher'); 
// const thesisProposalSchema = require('./ThesisProposal'); // Opzionale, se vuoi annidare i dettagli della proposta

const thesisApplicationSchema = z
  .object({
    id: z.number(),
    topic: z.string(),
    status: z.enum(["pending", "rejected", "accepted", "canceled", "conclusion_requested", "conclusion_accepted", "done"]),
    submission_date: z.date(),
    is_embargo: z.boolean().nullable(),
    request_conclusion: z.date().nullable(),
    conclusion_confirmation: z.date().nullable(),
    student: studentSchema.optional(),
    company: companySchema.nullable().optional(),
    

    teachers: z.array(teacherSchema).default([]),
  })
  .transform(application => {
    const teachers = application.teachers || [];
    
    // Logica per separare supervisore e cosupervisori (simile al tuo esempio)
    // Nota: Dipende da come Sequelize restituisce il pivot. 
    // Spesso è in: teacher.ThesisApplicationSupervisor.is_supervisor
    const supervisor = teachers.find(t => t.ThesisApplicationSupervisor?.is_supervisor === true) || null;
    const coSupervisors = teachers.filter(t => t.ThesisApplicationSupervisor?.is_supervisor === false);

    // Pulizia dell'oggetto teacher (rimozione dati pivot se necessario)
    if (supervisor) delete supervisor.ThesisApplicationSupervisor;
    coSupervisors.forEach(co => delete co.ThesisApplicationSupervisor);

    return {
      id: application.id,
      topic: application.topic,
      status: application.status,
      submissionDate: application.submission_date,
      isEmbargo: application.is_embargo,
      requestConclusion: application.request_conclusion,
      conclusionConfirmation: application.conclusion_confirmation,
      
      student: application.student, // Restituisce l'oggetto studente intero
      company: application.company, // Restituisce l'oggetto azienda o null
      
      supervisor: supervisor,
      coSupervisors: coSupervisors,
    };
  });

module.exports = thesisApplicationSchema;