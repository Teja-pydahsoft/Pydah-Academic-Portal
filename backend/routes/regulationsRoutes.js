const express = require('express');
const router = express.Router();
const regulationsController = require('../controllers/regulationsController');
const { authenticateToken } = require('../middleware/auth');

router.get('/', authenticateToken, regulationsController.getAllRegulations);
router.post('/', authenticateToken, regulationsController.createRegulation);
router.put('/:id', authenticateToken, regulationsController.updateRegulation);
router.delete('/:id', authenticateToken, regulationsController.deleteRegulation);
router.get('/:id/batches', authenticateToken, regulationsController.getBatchMappings);
router.post('/:id/batches', authenticateToken, regulationsController.assignBatches);

module.exports = router;
