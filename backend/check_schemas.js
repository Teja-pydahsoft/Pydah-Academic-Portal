const { masterPool } = require('./config/database');

const checkSchemas = async () => {
    try {
        console.log('--- rbac_users Schema ---');
        const [rbacRows] = await masterPool.query('DESCRIBE rbac_users');
        rbacRows.forEach(row => console.log(`${row.Field}: ${row.Type}`));

        console.log('\n--- faculty Schema ---');
        const [facultyRows] = await masterPool.query('DESCRIBE faculty');
        facultyRows.forEach(row => console.log(`${row.Field}: ${row.Type}`));

        process.exit(0);
    } catch (error) {
        console.error('Error checking schemas:', error);
        process.exit(1);
    }
};

checkSchemas();
