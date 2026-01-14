const express = require('express');
const router = express.Router();
const {
  getThesisApplications,
  createThesisApplication,
  getThesisApplicationById,
  updateThesisApplicationStatus,
  checkStudentEligibility,
  getStudentActiveApplication
} = require('../controllers/thesis-applications');

router.get('/', getThesisApplications);
router.post('/', createThesisApplication);
router.get('/eligibility', checkStudentEligibility);
router.get('/active', getStudentActiveApplication);
router.get('/:id', getThesisApplicationById);
router.patch('/:id/status', updateThesisApplicationStatus);
module.exports = router;