const express = require('express');
const router = express.Router();
const hrmsController = require('../controllers/hrmsController');

router.get('/employees', hrmsController.getEmployees);

module.exports = router;
