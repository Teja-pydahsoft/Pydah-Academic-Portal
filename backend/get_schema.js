const mysql = require('mysql2/promise');
const fs = require('fs').promises;

async function run() {
    const conn = await mysql.createConnection({
        host: 'student-database.cfu0qmo26gh3.ap-south-1.rds.amazonaws.com',
        user: 'admin',
        password: 'Student!0000',
        database: 'student_database'
    });

    const tables = ['colleges', 'courses', 'course_branches', 'subjects', 'timetable_entries'];
    const schema = {};
    for (const table of tables) {
        try {
            const [rows] = await conn.query(`SHOW CREATE TABLE ${table}`);
            schema[table] = rows[0]['Create Table'];
        } catch (e) {
            schema[table] = 'Error: ' + e.message;
        }
    }
    await fs.writeFile('schema_output.json', JSON.stringify(schema, null, 2), 'utf-8');
    await conn.end();
}
run();
