const express = require('express');
const router = express.Router();
const controller = require('../controllers/facultyController');
const { authenticateToken } = require('../middleware/auth');

router.get('/', authenticateToken, controller.getAllFaculty);

module.exports = router;
