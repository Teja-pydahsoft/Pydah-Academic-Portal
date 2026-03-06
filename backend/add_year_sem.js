const { masterPool } = require('./config/database');

async function addCols() {
    try {
        await masterPool.query('ALTER TABLE regulations ADD COLUMN total_years tinyint NOT NULL DEFAULT 4 AFTER branch_id');
        await masterPool.query('ALTER TABLE regulations ADD COLUMN semesters_per_year tinyint NOT NULL DEFAULT 2 AFTER total_years');
        console.log('Added total_years and semesters_per_year to regulations table');
    } catch (err) {
        if (err.code === 'ER_DUP_FIELDNAME') {
            console.log('Columns already exist.');
        } else {
            console.error(err);
        }
    } finally {
        process.exit();
    }
}
addCols();
