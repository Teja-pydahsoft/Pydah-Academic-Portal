const { masterPool } = require('../config/database');

exports.getAllFaculty = async (req, res) => {
    try {
        const [rows] = await masterPool.query('SELECT * FROM faculty WHERE is_active = 1');
        res.json({ success: true, data: rows });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
