const express = require('express');
const jobController = require('../controllers/jobController');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

router.get('/', jobController.listOpenJobs);
router.get('/:jobId', authenticateOptional, jobController.getJob);
router.post('/', authenticate, authorize('recruiter'), jobController.createJob);
router.patch('/:jobId', authenticate, authorize('recruiter'), jobController.updateJob);
router.post('/:jobId/archive', authenticate, authorize('recruiter'), jobController.archiveJob);
router.post('/:jobId/duplicate', authenticate, authorize('recruiter'), jobController.duplicateJob);

function authenticateOptional(req, _res, next) {
  if (!req.headers.authorization) {
    return next();
  }
  return authenticate(req, _res, next);
}

module.exports = router;
