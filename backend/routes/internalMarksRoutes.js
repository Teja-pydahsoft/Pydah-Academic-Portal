const express = require('express');
const router = express.Router();
const controller = require('../controllers/internalMarksController');
const { authenticateToken } = require('../middleware/auth');

router.get('/', authenticateToken, controller.getMarks);

module.exports = router;
