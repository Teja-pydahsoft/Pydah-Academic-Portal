const { masterPool } = require('./config/database');

async function migrate() {
    let connection;
    try {
        connection = await masterPool.getConnection();
        await connection.beginTransaction();

        console.log('1. Checking current subjects columns...');
        const [subCols] = await connection.query("SHOW COLUMNS FROM subjects LIKE 'branch_id'");

        if (subCols.length === 0) {
            console.log('   Adding branch_id to subjects...');
            await connection.query('ALTER TABLE subjects ADD COLUMN branch_id int DEFAULT NULL AFTER regulation_id');
        } else {
            console.log('   branch_id already exists in subjects - skipping add.');
        }

        console.log('2. Checking regulations for branch_id column...');
        const [regCols] = await connection.query("SHOW COLUMNS FROM regulations LIKE 'branch_id'");

        if (regCols.length > 0) {
            console.log('   Migrating branch_id from regulations -> subjects...');
            // For each subject, find its regulation and copy branch_id
            await connection.query(`
                UPDATE subjects s
                JOIN regulations r ON s.regulation_id = r.id
                SET s.branch_id = r.branch_id
                WHERE s.branch_id IS NULL AND r.branch_id IS NOT NULL
            `);

            console.log('   Migration complete. Dropping branch_id from regulations...');
            // Drop unique key that includes branch_id first
            try {
                await connection.query('ALTER TABLE regulations DROP INDEX uniq_regulation_scope');
            } catch (e) { console.log('   Index may not exist, skipping.'); }

            await connection.query('ALTER TABLE regulations DROP COLUMN branch_id');

            // Recreate unique key without branch_id
            await connection.query('ALTER TABLE regulations ADD UNIQUE KEY uniq_regulation_scope (name, college_id, course_id)');
            console.log('   Unique constraint recreated without branch_id.');
        } else {
            console.log('   branch_id already removed from regulations - nothing to migrate.');
        }

        await connection.commit();
        console.log('✅ Migration complete!');
    } catch (err) {
        if (connection) await connection.rollback();
        console.error('❌ Migration failed:', err.message);
    } finally {
        if (connection) connection.release();
        process.exit();
    }
}

migrate();
