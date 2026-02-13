const { masterPool } = require('../config/database');

// Helper to get distinct values and counts
const getStats = async (field) => {
    // Ensuring basic injection safety by whitelisting fields not needed here as we use fixed strings, but good practice
    // Query: SELECT field, COUNT(*) FROM students GROUP BY field
    const query = `
        SELECT ${field} as name, COUNT(*) as student_count 
        FROM students 
        WHERE ${field} IS NOT NULL AND ${field} != ''
        GROUP BY ${field}
        ORDER BY name
    `;
    const [rows] = await masterPool.query(query);
    return rows;
};

exports.getInstitutionDetails = async (req, res) => {
    try {
        const type = req.query.type; // 'colleges', 'courses', 'branches'

        let data = [];
        if (type === 'colleges') {
            data = await getStats('college');
        } else if (type === 'courses') {
            data = await getStats('course');
        } else if (type === 'branches') {
            data = await getStats('branch');
        } else {
            // Default to returning all if no type specified
            const colleges = await getStats('college');
            const courses = await getStats('course');
            const branches = await getStats('branch');
            return res.json({
                success: true,
                data: {
                    colleges,
                    courses,
                    branches
                }
            });
        }

        res.json({
            success: true,
            data
        });
    } catch (error) {
        console.error('Error fetching institution details:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};
