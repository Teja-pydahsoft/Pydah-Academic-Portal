const { masterPool } = require('../config/database');

exports.getAttendance = async (req, res) => {
    try {
        const { date, department, semester } = req.query;
        let query = `
      SELECT a.*, s.student_name as student_name, sub.name as subject_name 
      FROM hourly_attendance a
      JOIN students s ON a.student_id = s.id
      JOIN subjects sub ON a.subject_id = sub.id
      WHERE 1=1
    `;
        const params = [];

        if (date) {
            query += ' AND a.date = ?';
            params.push(date);
        }
        if (department) {
            query += ' AND s.branch_id = ?';
            params.push(department);
        }
        // Add more filters as needed

        const [rows] = await masterPool.query(query, params);
        res.json({ success: true, data: rows });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.postAttendance = async (req, res) => {
    try {
        const { studentId, subjectId, date, period, status, facultyId } = req.body;
        // Logic to insert attendance
        await masterPool.query(
            'INSERT INTO hourly_attendance (student_id, subject_id, date, period, status, posted_by) VALUES (?, ?, ?, ?, ?, ?)',
            [studentId, subjectId, date, period, status, facultyId]
        );
        res.json({ success: true, message: "Attendance posted successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
