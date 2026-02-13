const { masterPool } = require('../config/database');

exports.getTimetable = async (req, res) => {
    try {
        res.json({ success: true, data: [] });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
