const express = require('express');
const applicationController = require('../controllers/applicationController');
const { authenticate, authorize } = require('../middleware/auth');
const { uploadResume, handleUploadError } = require('../middleware/upload');

const router = express.Router();

router.post(
  '/jobs/:jobId/applications',
  authenticate,
  authorize('applicant'),
  uploadResume,
  handleUploadError,
  applicationController.applyToJob
);
router.get(
  '/jobs/:jobId/applications',
  authenticate,
  authorize('recruiter'),
  applicationController.listJobApplications
);
router.get(
  '/applicant/applications',
  authenticate,
  authorize('applicant'),
  applicationController.listApplicantApplications
);
router.get('/applications/:applicationId', authenticate, applicationController.getApplication);
router.patch(
  '/applications/:applicationId/status',
  authenticate,
  authorize('recruiter'),
  applicationController.updateStage
);
router.get('/applications/:applicationId/resume-url', authenticate, applicationController.getResumeUrl);
router.post('/applications/:applicationId/reanalyze', authenticate, applicationController.reanalyzeApplication);
router.post(
  '/applications/:applicationId/notes',
  authenticate,
  authorize('recruiter'),
  applicationController.addNote
);
router.post(
  '/jobs/:jobId/applications/bulk-status',
  authenticate,
  authorize('recruiter'),
  applicationController.bulkUpdateStage
);
router.patch(
  '/applications/:applicationId/tags',
  authenticate,
  authorize('recruiter'),
  applicationController.updateTags
);
router.patch(
  '/applications/:applicationId/scorecard',
  authenticate,
  authorize('recruiter'),
  applicationController.updateScorecard
);

module.exports = router;
