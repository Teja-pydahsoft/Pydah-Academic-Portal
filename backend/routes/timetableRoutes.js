const express = require('express');
const router = express.Router();
const controller = require('../controllers/timetableController');
const { authenticateToken } = require('../middleware/auth');

router.get('/', authenticateToken, controller.getTimetable);

module.exports = router;
