const { masterPool } = require('../config/database');

exports.getInstitutionDetails = async (req, res) => {
    try {
        const type = req.query.type; // 'colleges', 'courses', 'branches'

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

        if (type === 'colleges') {
            const data = await getColleges();
            return res.json({ success: true, data });
        } else if (type === 'courses') {
            const data = await getCourses();
            return res.json({ success: true, data });
        } else if (type === 'branches') {
            const data = await getBranches();
            return res.json({ success: true, data });
        }

        // Default all
        const [colleges, courses, branches] = await Promise.all([
            getColleges(),
            getCourses(),
            getBranches()
        ]);

        return res.json({
            success: true,
            data: {
                colleges,
                courses,
                branches
            }
        });

    } catch (error) {
        console.error('Error fetching institution details:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};
