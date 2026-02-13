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

router.get('/details', authenticateToken, async (req, res) => {
    try {
        const type = req.query.type;

        if (type === 'colleges') {
            const data = await getStats('college');
            return res.json({ success: true, data });
        } else if (type === 'courses') {
            const data = await getStats('course');
            return res.json({ success: true, data });
        } else if (type === 'branches') {
            const data = await getStats('branch');
            return res.json({ success: true, data });
        } else if (type === 'batches') {
            const data = await getStats('batch');
            return res.json({ success: true, data });
        }

        const colleges = await getStats('college');
        const courses = await getStats('course');
        const branches = await getStats('branch');
        const batches = await getStats('batch');

        res.json({
            success: true,
            data: {
                colleges,
                courses,
                branches,
                batches
            }
        });

    } catch (error) {
        console.error('Error fetching institution details:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
});

module.exports = router;
