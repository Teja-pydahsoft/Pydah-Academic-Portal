const express = require('express');
const router = express.Router();
const controller = require('../controllers/subjectsController');
const { authenticateToken } = require('../middleware/auth');

router.get('/', authenticateToken, controller.getAllSubjects);

module.exports = router;
