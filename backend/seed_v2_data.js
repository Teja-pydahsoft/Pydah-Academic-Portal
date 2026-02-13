const { masterPool } = require('./config/database');
const bcrypt = require('bcryptjs');

const seedData = async () => {
    try {
        console.log('--- Seeding V2 Data ---');

        // 1. Seed Faculty
        // Check if faculty exists first
        const [existingFaculty] = await masterPool.query('SELECT COUNT(*) as count FROM faculty');
        if (existingFaculty[0].count === 0) {
            console.log('Seeding Faculty...');
            await masterPool.query(`
        INSERT INTO faculty (name, email, department, designation, is_active) VALUES 
        ('Dr. Alan Turing', 'alan@pydah.col', 'CSE', 'Professor', 1),
        ('Dr. Grace Hopper', 'grace@pydah.col', 'CSE', 'HOD', 1),
        ('Prof. Nikola Tesla', 'tesla@pydah.col', 'EEE', 'Assistant Professor', 1)
      `);
        } else {
            console.log('Faculty already seeded.');
        }

        // 2. Seed Period Slots
        const [existingSlots] = await masterPool.query('SELECT COUNT(*) as count FROM period_slots');
        if (existingSlots[0].count === 0) {
            console.log('Seeding Period Slots...');
            await masterPool.query(`
        INSERT INTO period_slots (name, start_time, end_time, is_active) VALUES 
        ('Period 1', '09:00:00', '09:50:00', 1),
        ('Period 2', '09:50:00', '10:40:00', 1),
        ('Break', '10:40:00', '11:00:00', 1),
        ('Period 3', '11:00:00', '11:50:00', 1),
        ('Period 4', '11:50:00', '12:40:00', 1)
      `);
        } else {
            console.log('Period Slots already seeded.');
        }

        // 3. Seed Hourly Attendance (requires valid student and subject IDs)
        // Fetch a student and a subject
        try {
            const [students] = await masterPool.query('SELECT id FROM students LIMIT 5');
            const [subjects] = await masterPool.query('SELECT id FROM subjects LIMIT 1');

            if (students.length > 0 && subjects.length > 0) {
                const [existingAtt] = await masterPool.query('SELECT COUNT(*) as count FROM hourly_attendance');
                if (existingAtt[0].count === 0) {
                    console.log('Seeding Hourly Attendance...');
                    const subjectId = subjects[0].id;
                    const date = new Date().toISOString().split('T')[0];

                    const values = students.map((s, index) => [
                        s.id,
                        subjectId,
                        date,
                        1, // Period 1
                        index % 5 === 0 ? 'Absent' : 'Present', // Every 5th student absent
                        1 // Posted by ID 1
                    ]);

                    await masterPool.query(
                        'INSERT INTO hourly_attendance (student_id, subject_id, date, period, status, posted_by) VALUES ?',
                        [values]
                    );
                } else {
                    console.log('Attendance already seeded.');
                }
            } else {
                console.log('Skipping attendance seed: No students or subjects found.');
            }
        } catch (e) {
            console.warn('Error seeding attendance (tables might be missing):', e.message);
        }

        console.log('Success! V2 Data seeding complete.');
        process.exit(0);
    } catch (error) {
        console.error('Error seeding data:', error);
        process.exit(1);
    }
};

seedData();
