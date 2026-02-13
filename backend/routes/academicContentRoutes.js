const express = require('express');
const router = express.Router();
const controller = require('../controllers/academicContentController');
const { authenticateToken } = require('../middleware/auth');

router.get('/', authenticateToken, controller.getContent);

module.exports = router;
