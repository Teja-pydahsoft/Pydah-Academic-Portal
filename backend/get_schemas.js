const { masterPool } = require('./config/database');

async function getCols() {
    try {
        const [subCols] = await masterPool.query('SHOW COLUMNS FROM subjects');
        console.log(subCols);
    } catch (err) {
        console.error(err);
    } finally {
        process.exit();
    }
}
getCols();
