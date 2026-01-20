const express = require('express');
const router = express.Router();
const {
  createThesisApplication,
  deleteLastThesisApplication,
  checkStudentEligibility,
  getAllThesisApplications,
  getLastStudentApplication,
  getStatusHistoryApplication,
  cancelThesisApplication,
} = require('../controllers/thesis-applications');

router.get('/eligibility', checkStudentEligibility);
router.get('/', getLastStudentApplication);
router.get('/all', getAllThesisApplications);
router.get('/status-history', getStatusHistoryApplication);
router.post('/', createThesisApplication);
router.delete('/', deleteLastThesisApplication);
router.post('/cancel', cancelThesisApplication);


module.exports = router;