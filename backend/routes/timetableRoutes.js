const express = require('express');
const router = express.Router();
const controller = require('../controllers/timetableController');
const { authenticateToken } = require('../middleware/auth');

router.get('/', authenticateToken, controller.getTimetable);
router.post('/', authenticateToken, controller.createTimetableEntry);
router.put('/:id', authenticateToken, controller.updateTimetableEntry);
router.delete('/:id', authenticateToken, controller.deleteTimetableEntry);

module.exports = router;
