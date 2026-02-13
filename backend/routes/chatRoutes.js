const express = require('express');
const router = express.Router();
const controller = require('../controllers/chatController');
const { authenticateToken } = require('../middleware/auth');

router.get('/', authenticateToken, controller.getMessages);

module.exports = router;
