const express = require('express');
const router = express.Router();
const controller = require('../controllers/hourlyAttendanceController');
const { authenticateToken } = require('../middleware/auth');

router.get('/', authenticateToken, controller.getAttendance);

module.exports = router;
