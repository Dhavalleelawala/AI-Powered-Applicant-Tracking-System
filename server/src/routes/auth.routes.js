const express = require('express');
const authController = require('../controllers/authController');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

router.post('/register/applicant', authController.registerApplicant);
router.post('/register/recruiter', authController.registerRecruiter);
router.post('/login', authController.login);
router.get('/me', authenticate, authController.getMe);
router.patch('/me', authenticate, authController.updateProfile);
router.get('/saved-jobs', authenticate, authorize('applicant'), authController.listSavedJobs);
router.post('/saved-jobs/:jobId', authenticate, authorize('applicant'), authController.toggleSavedJob);

module.exports = router;
