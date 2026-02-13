const { masterPool } = require('../config/database');

exports.getAllSubjects = async (req, res) => {
    try {
        const [rows] = await masterPool.query('SELECT * FROM subjects');
        res.json({ success: true, data: rows });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
