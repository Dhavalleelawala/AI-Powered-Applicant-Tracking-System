const express = require('express');
const fileController = require('../controllers/fileController');

const router = express.Router();

router.get('/:token', fileController.getFile);

module.exports = router;
