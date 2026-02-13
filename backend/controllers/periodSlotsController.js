const { masterPool } = require('../config/database');

exports.getAllSlots = async (req, res) => {
    try {
        const [rows] = await masterPool.query('SELECT * FROM period_slots');
        res.json({ success: true, data: rows });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
