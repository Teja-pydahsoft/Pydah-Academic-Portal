const express = require('express');
const router = express.Router();
const controller = require('../controllers/periodSlotsController');
const { authenticateToken } = require('../middleware/auth');

router.get('/', authenticateToken, controller.getAllSlots);

module.exports = router;
