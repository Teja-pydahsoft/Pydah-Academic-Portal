const express = require('express');
const router = express.Router();
const controller = require('../controllers/subjectsController');
const { authenticateToken } = require('../middleware/auth');

router.get('/', authenticateToken, controller.getAllSubjects);
router.post('/', authenticateToken, controller.createSubject);
router.put('/:id', authenticateToken, controller.updateSubject);
router.delete('/:id', authenticateToken, controller.deleteSubject);

module.exports = router;
