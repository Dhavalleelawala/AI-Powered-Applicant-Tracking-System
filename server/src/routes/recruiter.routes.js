const express = require('express');
const jobController = require('../controllers/jobController');
const hiringController = require('../controllers/hiringController');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

router.get('/jobs', authenticate, authorize('recruiter'), jobController.listRecruiterJobs);
router.get('/analytics', authenticate, authorize('recruiter'), hiringController.analytics);
router.get('/candidates', authenticate, authorize('recruiter'), hiringController.searchCandidates);

module.exports = router;
