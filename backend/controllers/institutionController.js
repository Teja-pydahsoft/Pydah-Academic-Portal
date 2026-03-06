const { masterPool } = require('../config/database');

exports.getInstitutionDetails = async (req, res) => {
    try {
        const { type, batch_id, college_id, course_id } = req.query;

        const getBatches = async () => {
            const query = `
                SELECT batch as id, batch as name, COUNT(*) as student_count 
                FROM students 
                WHERE batch IS NOT NULL AND batch != ''
                GROUP BY batch
                ORDER BY batch DESC
            `;
            const [rows] = await masterPool.query(query);
            return rows;
        };

        const getColleges = async () => {
            const [rows] = await masterPool.query('SELECT id, name FROM colleges ORDER BY name');
            return rows;
        };

        const getCourses = async () => {
            let query = 'SELECT id, name, college_id, total_years, semesters_per_year FROM courses';
            const params = [];
            if (college_id) {
                query += ' WHERE college_id = ?';
                params.push(college_id);
            }
            query += ' ORDER BY name';
            const [rows] = await masterPool.query(query, params);
            return rows;
        };

        const getBranches = async () => {
            let query = 'SELECT id, name, course_id, total_years, semesters_per_year FROM course_branches';
            const params = [];
            if (course_id) {
                query += ' WHERE course_id = ?';
                params.push(course_id);
            }
            query += ' ORDER BY name';
            const [rows] = await masterPool.query(query, params);
            return rows;
        };

        if (type === 'batches') {
            const data = await getBatches();
            return res.json({ success: true, data });
        } else if (type === 'colleges') {
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
        const [batches, colleges, courses, branches] = await Promise.all([
            getBatches(),
            getColleges(),
            getCourses(),
            getBranches()
        ]);

        return res.json({
            success: true,
            data: {
                batches,
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
