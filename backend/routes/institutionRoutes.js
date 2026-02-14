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

// Listing master data queries
router.get('/details', authenticateToken, async (req, res) => {
    try {
        const type = req.query.type;

        // Queries for Master Tables
        const getColleges = async () => {
            const [rows] = await masterPool.query('SELECT id, name FROM colleges ORDER BY name');
            return rows;
        };
        const getCourses = async () => {
            const [rows] = await masterPool.query('SELECT id, name FROM courses ORDER BY name');
            return rows;
        };
        const getBranches = async () => {
            const [rows] = await masterPool.query('SELECT id, name FROM course_branches ORDER BY name');
            return rows;
        };

        // Helper for batches (keep from students table for now or specific batch table if known)
        // We'll use the existing getStats for batches if type is batches or all
        const getBatches = async () => getStats('batch');

        if (type === 'colleges') {
            const data = await getColleges();
            return res.json({ success: true, data });
        } else if (type === 'courses') {
            const data = await getCourses();
            return res.json({ success: true, data });
        } else if (type === 'branches') {
            const data = await getBranches();
            return res.json({ success: true, data });
        } else if (type === 'batches') {
            const data = await getBatches();
            return res.json({ success: true, data });
        }

        const [colleges, courses, branches, batches] = await Promise.all([
            getColleges(),
            getCourses(),
            getBranches(),
            getBatches()
        ]);

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
