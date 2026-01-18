const { Op } = require('sequelize');
const { QueryTypes } = require('sequelize');
const { z } = require('zod');
const {
  sequelize,
  Teacher,
  ThesisApplication,
  ThesisApplicationSupervisorCoSupervisor,
  ThesisApplicationStatusHistory,
} = require('../models');
const thesisApplicationRequestSchema = require('../schemas/ThesisApplicationRequest');
const thesisApplicationResponseSchema = require('../schemas/ThesisApplicationResponse');
const selectTeacherAttributes = require('../utils/selectTeacherAttributes');



// ==========================================
// CONTROLLERS
// ==========================================


const createThesisApplication = async (req, res) => {
  const t = await sequelize.transaction();

  try {

    const applicationData = thesisApplicationRequestSchema.parse(req.body);
    const supervisorData = await Teacher.findByPk(applicationData.supervisor.id, 
      { 
        attributes: selectTeacherAttributes(true), 
      });
    const coSupervisorsData = [];
    if (applicationData.coSupervisors) {
      for (const coSup of applicationData.coSupervisors) {
        const coSupervisor = await Teacher.findByPk(coSup.id, { attributes: selectTeacherAttributes(true) });
        if (coSupervisor) coSupervisorsData.push(coSupervisor);
      }
    }
    const loggedStudent = await sequelize.query(
      `
      SELECT 
        s.*
      FROM student s
      INNER JOIN logged_student ls ON s.id = ls.student_id
      LIMIT 1
      `,
      { type: QueryTypes.SELECT },
    );

    // Create ThesisApplication
    const newApplication = await ThesisApplication.create({
      topic: applicationData.topic,
      student_id: loggedStudent[0].id,
      thesis_proposal_id: applicationData.proposal ? applicationData.proposal.id : null,
      company_id: applicationData.company ? applicationData.company.id : null,
      status: 'pending',
      submission_date: new Date().toISOString()
    }, { transaction: t });
    // Link Supervisor and Co-Supervisors
    const supervisors = [applicationData.supervisor, ...(applicationData.coSupervisors || [])];
    for (const supervisor of supervisors) {
      await ThesisApplicationSupervisorCoSupervisor.create({
        thesis_application_id: newApplication.id,
        teacher_id: supervisor.id,
        is_supervisor: supervisor.id === applicationData.supervisor.id,
      }, { transaction: t });
    }
    // Link Status History - initial status
    await ThesisApplicationStatusHistory.create({
      thesis_application_id: newApplication.id,
      old_status: null,
      new_status: newApplication.status || 'pending',
      change_date: newApplication.submission_date,
    }, { transaction: t });
    await t.commit();
    const responsePayload = {
      id: newApplication.id,
      topic: newApplication.topic,
      supervisor: supervisorData,
      coSupervisors: coSupervisorsData,
      company: newApplication.company || null,
      proposal: newApplication.proposal || null,
      submissionDate: newApplication.submission_date.toISOString(),
      status: newApplication.status || 'pending',
    };

    const validatedResponse = await thesisApplicationResponseSchema.parseAsync(responsePayload);
    return res.status(201).json(validatedResponse);
  } catch (error) {
    console.error(error);
    console.error(error?.stack);
    if (t && !t.finished) await t.rollback();
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    return res.status(500).json({ error: error.message });
  }
};

const checkStudentEligibility = async (req, res) => {
  try {
    const loggedStudent = await sequelize.query(
      `
      SELECT 
        s.*
      FROM student s
      INNER JOIN logged_student ls ON s.id = ls.student_id
      LIMIT 1
      `,
      { type: QueryTypes.SELECT },
    );

    const links = await ThesisApplication.findAll({
      where: { student_id: loggedStudent[0].id }
    });

    const applicationIds = links.map(l => l.id);

    let eligible = true;
    if (applicationIds.length > 0) {
      const activeApplication = await ThesisApplication.findAll({
        where: {
          id: { [Op.in]: applicationIds },
          status: { [Op.in]: ['pending', 'approved'] }
        }
      });
      if (activeApplication.length > 0) eligible = false;
    }

    res.json({ studentId: loggedStudent[0].id, eligible });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getLastStudentApplication = async (req, res) => {
  try {
    const loggedStudent = await sequelize.query(
      `
      SELECT 
        s.*
      FROM student s
      INNER JOIN logged_student ls ON s.id = ls.student_id
      LIMIT 1
      `,
      { type: QueryTypes.SELECT },
    );

    const activeApplication = await ThesisApplication.findAll({
      where: {
        student_id: loggedStudent[0].id,
      },
      order: [['submission_date', 'DESC']],
      limit: 1,
    });

    if (activeApplication.length === 0) {
      return res.status(404).json({ error: 'No active application found for the student' });
    }

    const app = activeApplication[0];

    // Fetch supervisor and co-supervisors
    const supervisorLinks = await ThesisApplicationSupervisorCoSupervisor.findAll({
      where: { thesis_application_id: app.id },
    });

    let supervisorData = null;
    const coSupervisorsData = [];

    for (const link of supervisorLinks) {
      const teacher = await Teacher.findByPk(link.teacher_id, {
        attributes: selectTeacherAttributes(true),
      });
      if (teacher) {
        if (link.is_supervisor) {
          supervisorData = teacher;
        } else {
          coSupervisorsData.push(teacher);
        }
      }
    }

    const responsePayload = {
      id: app.id,
      topic: app.topic,
      supervisor: supervisorData,
      coSupervisors: coSupervisorsData,
      company: app.company || null,
      proposal: app.proposal || null,
      submissionDate: app.submission_date.toISOString(),
      status: app.status || 'pending',
    };

    const activeAppJson = thesisApplicationResponseSchema.parse(responsePayload);

    res.json(activeAppJson);

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

const deleteLastThesisApplication = async (req, res) => {
  const t = await sequelize.transaction();

  try {
    const loggedStudent = await sequelize.query(
      `
      SELECT 
        s.*
      FROM student s
      INNER JOIN logged_student ls ON s.id = ls.student_id
      LIMIT 1
      `,
      { type: QueryTypes.SELECT },
    );

    const links = await ThesisApplication.findAll({
      where: { student_id: loggedStudent[0].id },
      transaction: t
    });

    if (!links.length) {
      await t.rollback();
      return res.status(404).json({ error: 'No application found to delete' });
    }

    const applicationIds = links.map(l => l.id);

    const lastApplication = await ThesisApplication.findOne({
      where: { id: { [Op.in]: applicationIds } },
      order: [['id', 'DESC']],
      transaction: t
    });

    if (!lastApplication) {
      await t.rollback();
      return res.status(404).json({ error: 'No application found to delete' });
    }

    // Must delete link rows first or rely on CASCADE
    // Since we have manual link tables, explicit delete is safer

    await ThesisApplicationSupervisorCoSupervisor.destroy({
      where: { thesis_application_id: lastApplication.id },
      transaction: t
    });

    await lastApplication.destroy({ transaction: t });

    await t.commit();
    res.status(200).json({ message: 'Last thesis application deleted successfully' });
  } catch (error) {
    await t.rollback();
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createThesisApplication,
  checkStudentEligibility,
  getLastStudentApplication,
  deleteLastThesisApplication,
};