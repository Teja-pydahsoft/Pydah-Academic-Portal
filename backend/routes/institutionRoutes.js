const express = require('express');
const router = express.Router();
const { masterPool } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

// Helper function to get stats
const getStats = async (field) => {
    // Basic SQL safety
    const fieldMap = {
        'college': 'college',
        'course': 'course',
        'branch': 'branch',
        'batch': 'batch'
    };

    const dbField = fieldMap[field];
    if (!dbField) return [];

    const query = `
        SELECT ${dbField} as name, COUNT(*) as student_count 
        FROM students 
        WHERE ${dbField} IS NOT NULL AND ${dbField} != ''
        GROUP BY ${dbField}
        ORDER BY name
    `;
    const [rows] = await masterPool.query(query);
    return rows;
};

const institutionController = require('../controllers/institutionController');

// Listing master data queries
router.get('/details', authenticateToken, institutionController.getInstitutionDetails);

module.exports = router;
