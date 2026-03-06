const { masterPool } = require('../config/database');

exports.getAllSlots = async (req, res) => {
    try {
        const { college_id } = req.query;
        let query = 'SELECT * FROM period_slots';
        let params = [];

        if (college_id) {
            query += ' WHERE college_id = ?';
            params.push(college_id);
        }

        query += ' ORDER BY sort_order ASC, start_time ASC';

        const [rows] = await masterPool.query(query, params);
        res.json({ success: true, data: rows });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.createSlot = async (req, res) => {
    try {
        const { college_id, slot_name, start_time, end_time, is_break, sort_order } = req.body;
        const [result] = await masterPool.query(
            'INSERT INTO period_slots (college_id, name, start_time, end_time, is_break, sort_order) VALUES (?, ?, ?, ?, ?, ?)',
            [college_id, slot_name, start_time, end_time, is_break || false, sort_order || 0]
        );
        res.json({ success: true, id: result.insertId });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.updateSlot = async (req, res) => {
    try {
        const { id } = req.params;
        const { college_id, slot_name, start_time, end_time, is_break, sort_order } = req.body;
        await masterPool.query(
            'UPDATE period_slots SET college_id = ?, name = ?, start_time = ?, end_time = ?, is_break = ?, sort_order = ? WHERE id = ?',
            [college_id, slot_name, start_time, end_time, is_break, sort_order, id]
        );
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.deleteSlot = async (req, res) => {
    try {
        const { id } = req.params;
        await masterPool.query('DELETE FROM period_slots WHERE id = ?', [id]);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
