const { masterPool } = require('./config/database');

const checkSchema = async () => {
    try {
        const tables = ['rbac_users', 'students', 'faculty', 'subjects', 'hourly_attendance'];
        const schema = {};

        for (const table of tables) {
            try {
                const [columns] = await masterPool.query(`DESCRIBE ${table}`);
                schema[table] = columns.map(c => c.Field);
            } catch (e) {
                schema[table] = `Error: ${e.message}`;
            }
        }

        console.log(JSON.stringify(schema, null, 2));
        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

checkSchema();
