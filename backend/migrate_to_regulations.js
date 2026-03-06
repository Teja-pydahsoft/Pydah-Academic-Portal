const { masterPool } = require('./config/database');

async function migrate() {
    let connection;
    try {
        connection = await masterPool.getConnection();
        await connection.beginTransaction();

        console.log('1. Creating regulations table...');
        await connection.query(`
            CREATE TABLE IF NOT EXISTS regulations (
                id int NOT NULL AUTO_INCREMENT,
                name varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
                college_id int NOT NULL,
                course_id int NOT NULL,
                branch_id int DEFAULT NULL,
                created_at timestamp NULL DEFAULT CURRENT_TIMESTAMP,
                updated_at timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                PRIMARY KEY (id),
                UNIQUE KEY uniq_regulation_scope (name, college_id, course_id, branch_id),
                KEY idx_college_course (college_id, course_id),
                KEY idx_branch (branch_id)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        `);

        console.log('2. Creating batch_regulations table...');
        await connection.query(`
            CREATE TABLE IF NOT EXISTS batch_regulations (
                id int NOT NULL AUTO_INCREMENT,
                batch varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
                regulation_id int NOT NULL,
                created_at timestamp NULL DEFAULT CURRENT_TIMESTAMP,
                PRIMARY KEY (id),
                UNIQUE KEY uniq_batch_regulation (batch, regulation_id),
                KEY idx_regulation (regulation_id),
                CONSTRAINT fk_batch_reg_regulation_id FOREIGN KEY (regulation_id) REFERENCES regulations (id) ON DELETE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        `);

        console.log('3. Adding regulation_id to subjects table...');
        try {
            await connection.query('ALTER TABLE subjects ADD COLUMN regulation_id int DEFAULT NULL AFTER id');
        } catch (e) {
            if (e.code !== 'ER_DUP_FIELDNAME') throw e;
            console.log('Column regulation_id already exists in subjects table.');
        }

        console.log('4. Migrating existing subjects to Default Regulations...');
        const [groups] = await connection.query('SELECT DISTINCT college_id, course_id, branch_id FROM subjects');

        for (const scope of groups) {
            const { college_id, course_id, branch_id } = scope;

            let regId;
            const branchQueryP = branch_id === null ? 'IS NULL' : '= ?';
            const queryParams = branch_id === null ? ['Legacy', college_id, course_id] : ['Legacy', college_id, course_id, branch_id];

            const [existingRegs] = await connection.query(
                "SELECT id FROM regulations WHERE name = ? AND college_id = ? AND course_id = ? AND branch_id " + branchQueryP,
                queryParams
            );

            if (existingRegs.length > 0) {
                regId = existingRegs[0].id;
            } else {
                const insertParams = [
                    'Legacy',
                    college_id || null,
                    course_id || null,
                    branch_id || null
                ];
                const [result] = await connection.query(
                    'INSERT INTO regulations (name, college_id, course_id, branch_id) VALUES (?, ?, ?, ?)',
                    insertParams
                );
                regId = result.insertId;
            }

            const branchUpdateP = branch_id === null ? 'IS NULL' : '= ?';
            const updateParams = branch_id === null ? [regId, college_id, course_id] : [regId, college_id, course_id, branch_id];

            await connection.query(
                "UPDATE subjects SET regulation_id = ? WHERE college_id = ? AND course_id = ? AND branch_id " + branchUpdateP,
                updateParams
            );
        }

        console.log('5. Enforcing NOT NULL and Foreign Key constraints on subjects.regulation_id...');
        await connection.query('ALTER TABLE subjects MODIFY regulation_id int NOT NULL');

        try {
            await connection.query('ALTER TABLE subjects ADD CONSTRAINT fk_subjects_regulation_id FOREIGN KEY (regulation_id) REFERENCES regulations(id) ON DELETE CASCADE');
        } catch (e) {
            console.log('Foreign key likely already exists or skipped.', e.message);
        }

        console.log('6. Cleaning up redundant columns from subjects table...');
        const dropCols = async (col, indexName) => {
            try {
                const [indexes] = await connection.query("SHOW INDEX FROM subjects WHERE Key_name = '" + indexName + "'");
                if (indexes.length > 0) {
                    await connection.query("ALTER TABLE subjects DROP INDEX " + indexName);
                }
            } catch (e) { }

            try {
                await connection.query("ALTER TABLE subjects DROP COLUMN " + col);
                console.log("Dropped column " + col);
            } catch (e) {
                if (e.code !== 'ER_CANT_DROP_FIELD_OR_KEY') {
                    console.log("Could not drop " + col + ": ", e.message);
                }
            }
        }

        await dropCols('college_id', 'idx_college_course');
        await dropCols('course_id', 'idx_college_course');
        await dropCols('branch_id', 'idx_branch');

        await connection.commit();
        console.log('✅ Migration successful!');
    } catch (error) {
        if (connection) await connection.rollback();
        console.error('❌ Migration failed:', error);
    } finally {
        if (connection) connection.release();
        process.exit();
    }
}

migrate();
