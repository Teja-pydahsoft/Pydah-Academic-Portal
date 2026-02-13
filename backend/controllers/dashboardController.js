const { masterPool } = require('../config/database');

exports.getDashboardStats = async (req, res) => {
    try {
        // 1. Total Colleges (Distinct from students table as we don't have a colleges master table yet?)
        // Actually checking schema... let's stick to students.college column
        const [collegeRows] = await masterPool.query('SELECT COUNT(DISTINCT college) as count FROM students WHERE college IS NOT NULL');
        const totalColleges = collegeRows[0].count;

        // 2. Total Faculty
        const [facultyRows] = await masterPool.query('SELECT COUNT(*) as count FROM faculty WHERE is_active = 1');
        const totalFaculty = facultyRows[0].count;

        // 3. Active Students - match actual DB values
        const [studentRows] = await masterPool.query('SELECT COUNT(*) as count FROM students WHERE student_status IN ("Regular", "Re-Joined", "Rejoined")');
        const totalStudents = studentRows[0].count;

        // 4. Regular Students (Admission Type: REGULAR and Active)
        const [regularRows] = await masterPool.query('SELECT COUNT(*) as count FROM students WHERE stud_type = "REGULAR" AND student_status IN ("Regular", "Re-Joined", "Rejoined")');
        const totalRegulars = regularRows[0].count;

        // 5. Today's Attendance
        const today = new Date().toISOString().split('T')[0];
        const [attendanceRows] = await masterPool.query('SELECT COUNT(*) as count FROM hourly_attendance WHERE date = ?', [today]);
        const totalAttendanceRecords = attendanceRows[0].count;

        let attendancePercentage = 0;
        if (totalAttendanceRecords > 0) {
            const [presentRows] = await masterPool.query('SELECT COUNT(*) as count FROM hourly_attendance WHERE date = ? AND status = "Present"', [today]);
            const presentCount = presentRows[0].count;
            attendancePercentage = Math.round((presentCount / totalAttendanceRecords) * 100);
        }

        res.json({
            success: true,
            data: {
                colleges: totalColleges,
                faculty: totalFaculty,
                students: totalStudents,
                regular_students: totalRegulars,
                attendance: attendancePercentage
            }
        });
    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};
