const { Op } = require('sequelize');
const {
  sequelize,
  ThesisApplication,
  ThesisApplicationSupervisor,
  Company,
  Student,
  Teacher,
  ThesisProposal
} = require('../models');
const thesisApplicationSchema = require('../schemas/ThesisApplication');
const getPaginationParams = require('../utils/paginationParams'); // Assumo esista come nel file proposals

const camelToSnakeCase = str => str.replace(/([A-Z])/g, '_$1').toLowerCase();

const getApplicationIncludes = () => [
  { model: Student },
  { model: Company },
  { model: ThesisProposal },
  {
    model: Teacher,
    through: { attributes: ['is_supervisor'] }
  }
];

const fetchThesisApplications = async (where, includes, pagination) => {
  const { limit, offset, orderBy, sortBy } = pagination;

  const validSortFields = [
    'submissionDate',
    'status',
    'topic',
    'id',
    'studentId'
  ];

  const normalizedSortBy = typeof sortBy === 'string' ? sortBy : 'id';
  const sortField = validSortFields.includes(normalizedSortBy)
    ? normalizedSortBy
    : 'id';
  const rawOrderBy = typeof orderBy === 'string' ? orderBy.toUpperCase() : 'ASC';
  const sortDirection = ['ASC', 'DESC'].includes(rawOrderBy)
    ? rawOrderBy
    : 'ASC';
  const sortBySnakeCase = camelToSnakeCase(sortField);

  const { count, rows } = await ThesisApplication.findAndCountAll({
    include: includes,
    where,
    order: [[sortBySnakeCase, sortDirection]],
    limit,
    offset,
    distinct: true
  });

  const applications = rows.map(app => thesisApplicationSchema.parse(app.toJSON()));

  return {
    count,
    applications,
    totalPages: limit > 0 ? Math.ceil(count / limit) : 0
  };
};

// ==========================================
// CONTROLLERS
// ==========================================

const getThesisApplications = async (req, res) => {
  try {
    const pagination = getPaginationParams(req.query);
    const includes = getApplicationIncludes();

    const where = {};

    if (req.query.status) {
      where.status = req.query.status;
    }

    if (req.query.studentId) {
      where.student_id = req.query.studentId;
    }

    if (req.query.thesisProposalId) {
      where.thesis_proposal_id = req.query.thesisProposalId;
    }

    const { count, applications, totalPages } = await fetchThesisApplications(
      where,
      includes,
      pagination
    );

    res.json({
      page: pagination.page,
      limit: pagination.limit,
      totalItems: count,
      totalPages,
      applications
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getThesisApplicationById = async (req, res) => {
  try {
    const { id } = req.params;

    const application = await ThesisApplication.findByPk(id, {
      include: getApplicationIncludes(),
    });

    if (!application) {
      return res.status(404).json({ error: 'Thesis application not found' });
    }

    const formattedApplication = thesisApplicationSchema.parse(application.toJSON());

    res.json(formattedApplication);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const createThesisApplication = async (req, res) => {
  const t = await sequelize.transaction();

  try {
    const {
      student_id,
      thesis_proposal_id,
      topic,
      company,
      supervisors
    } = req.body;

    let companyId = null;

    if (company && company.name) {
      const [comp] = await Company.findOrCreate({
        where: { name: company.name },
        defaults: { address: company.address },
        transaction: t
      });
      companyId = comp.id;
    }

    const newApplication = await ThesisApplication.create({
      student_id,
      thesis_proposal_id: thesis_proposal_id || null,
      topic,
      company_id: companyId,
      status: 'pending'
    }, { transaction: t });

    if (supervisors && supervisors.length > 0) {
      const supervisorData = supervisors.map(sup => ({
        thesis_application_id: newApplication.id,
        teacher_id: sup.teacher_id,
        is_supervisor: sup.is_supervisor
      }));
      await ThesisApplicationSupervisor.bulkCreate(supervisorData, { transaction: t });
    }

    await t.commit();

    // Fetch dell'oggetto creato per restituirlo formattato
    const createdApp = await ThesisApplication.findByPk(newApplication.id, {
      include: getApplicationIncludes()
    });

    res.status(201).json(thesisApplicationSchema.parse(createdApp.toJSON()));
  } catch (error) {
    await t.rollback();
    res.status(500).json({ error: error.message });
  }
};

const updateThesisApplicationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ["pending", "rejected", "accepted", "canceled", "conclusion_requested", "conclusion_accepted", "done"];
    if (!validStatuses.includes(status)) {
      throw new Error('Invalid status parameter');
    }

    const application = await ThesisApplication.findByPk(id);

    if (!application) {
      return res.status(404).json({ error: 'Thesis application not found' });
    }

    application.status = status;
    await application.save();

    res.json({
      id: application.id,
      status: application.status,
      message: 'Status updated successfully'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const checkStudentEligibility = async (req, res) => {
  try {
    const { studentId } = req.query;

    if (!studentId) {
      return res.status(400).json({ error: 'studentId query parameter is required' });
    }

    const activeApplication = await ThesisApplication.findOne({
      where: {
        student_id: studentId,
        status: {
          [Op.notIn]: ['canceled', 'rejected', 'done']
        }
      }
    });

    res.json({ eligible: !activeApplication });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getThesisApplications,
  getThesisApplicationById,
  createThesisApplication,
  updateThesisApplicationStatus,
  checkStudentEligibility
};