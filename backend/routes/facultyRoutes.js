const express = require('express');
const router = express.Router();
const controller = require('../controllers/facultyController');
const { authenticateToken } = require('../middleware/auth');

router.get('/', authenticateToken, controller.getAllFaculty);
router.post('/', authenticateToken, controller.createFaculty);
router.put('/:id', authenticateToken, controller.updateFaculty);
router.delete('/:id', authenticateToken, controller.deleteFaculty);

module.exports = router;
