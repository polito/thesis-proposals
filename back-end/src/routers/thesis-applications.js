const express = require('express');
const router = express.Router();
const {
  createThesisApplication,
  deleteLastThesisApplication,
  checkStudentEligibility,
  getLastStudentApplication
} = require('../controllers/thesis-applications');

router.get('/eligibility', checkStudentEligibility);
router.get('/', getLastStudentApplication);
router.post('/', createThesisApplication);
router.delete('/', deleteLastThesisApplication);


module.exports = router;