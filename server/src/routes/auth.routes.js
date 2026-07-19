const express = require('express');
const authController = require('../controllers/authController');

const router = express.Router();

router.post('/register/applicant', authController.registerApplicant);

module.exports = router;
