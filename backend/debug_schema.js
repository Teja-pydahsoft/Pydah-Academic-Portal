const { masterPool } = require('./config/database');

const checkTables = async () => {
    try {
        const tables = ['rbac_users', 'students', 'faculty', 'subjects', 'hourly_attendance', 'period_slots', 'departments', 'branches'];

        console.log('--- SCHEMA DEBUG ---');

        for (const table of tables) {
            try {
                const [columns] = await masterPool.query(`DESCRIBE ${table}`);
                console.log(`\nTable: ${table}`);
                console.log(columns.map(c => `${c.Field} (${c.Type})`).join(', '));
            } catch (e) {
                console.log(`\nTable: ${table} - DOES NOT EXIST or Error: ${e.message}`);
            }
        }

        process.exit(0);
    } catch (error) {
        console.error('Main error:', error);
        process.exit(1);
    }
};

checkTables();
