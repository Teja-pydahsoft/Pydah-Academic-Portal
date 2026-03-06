const { masterPool } = require('../config/database');

// GET all subjects with advanced filtering
exports.getAllSubjects = async (req, res) => {
    try {
        const { regulation_id, branch_id, batch, year_of_study, semester_number } = req.query;

        let activeRegulationId = regulation_id;

        // Auto-resolve regulation from batch if needed
        if (batch && !activeRegulationId) {
            const [batchRegs] = await masterPool.query('SELECT regulation_id FROM batch_regulations WHERE batch = ?', [batch]);
            if (batchRegs.length > 0) {
                activeRegulationId = batchRegs[0].regulation_id;
            } else {
                return res.json({ success: true, data: [] });
            }
        }

        let whereClause = 'WHERE 1=1';
        const queryParams = [];

        if (activeRegulationId) {
            whereClause += ' AND s.regulation_id = ?';
            queryParams.push(activeRegulationId);
        }
        if (branch_id) {
            whereClause += ' AND s.branch_id = ?';
            queryParams.push(branch_id);
        }
        if (year_of_study) {
            whereClause += ' AND s.year_of_study = ?';
            queryParams.push(year_of_study);
        }
        if (semester_number) {
            whereClause += ' AND s.semester_number = ?';
            queryParams.push(semester_number);
        }

        const query = `
            SELECT s.*, r.name as regulation_name, r.college_id, r.course_id,
                   b.name as branch_name
            FROM subjects s
            LEFT JOIN regulations r ON s.regulation_id = r.id
            LEFT JOIN course_branches b ON s.branch_id = b.id
            ${whereClause}
            ORDER BY s.year_of_study ASC, s.semester_number ASC, s.name ASC
        `;

        const [rows] = await masterPool.query(query, queryParams);
        res.json({ success: true, data: rows });
    } catch (error) {
        console.error('Error fetching subjects:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// POST create subject
exports.createSubject = async (req, res) => {
    try {
        const {
            regulation_id, branch_id, year_of_study, semester_number,
            name, code, subject_type, units, experiments_count, credits
        } = req.body;

        if (!regulation_id || !name || !year_of_study || !semester_number) {
            return res.status(400).json({ success: false, message: 'Regulation, Year, Semester, and Name are required' });
        }

        const query = `
            INSERT INTO subjects 
            (regulation_id, branch_id, year_of_study, semester_number, name, code, subject_type, units, experiments_count, credits, is_active) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
        `;
        const values = [
            regulation_id, branch_id || null, year_of_study, semester_number,
            name, code || null, subject_type || 'theory',
            units || null, experiments_count || null, credits || null
        ];

        const [result] = await masterPool.query(query, values);
        const [newSubject] = await masterPool.query('SELECT * FROM subjects WHERE id = ?', [result.insertId]);

        res.status(201).json({ success: true, message: 'Subject created successfully', data: newSubject[0] });
    } catch (error) {
        console.error('Error creating subject:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// PUT update subject
exports.updateSubject = async (req, res) => {
    try {
        const { id } = req.params;
        const { branch_id, year_of_study, semester_number, name, code, subject_type, units, experiments_count, credits, is_active } = req.body;

        const [existing] = await masterPool.query('SELECT id FROM subjects WHERE id = ?', [id]);
        if (existing.length === 0) {
            return res.status(404).json({ success: false, message: 'Subject not found' });
        }

        const query = `
            UPDATE subjects SET 
                branch_id = COALESCE(?, branch_id),
                year_of_study = COALESCE(?, year_of_study),
                semester_number = COALESCE(?, semester_number),
                name = COALESCE(?, name),
                code = ?,
                subject_type = COALESCE(?, subject_type),
                units = ?,
                experiments_count = ?,
                credits = ?,
                is_active = COALESCE(?, is_active)
            WHERE id = ?
        `;
        const values = [
            branch_id || null, year_of_study, semester_number, name,
            code || null, subject_type, units || null, experiments_count || null,
            credits || null, is_active, id
        ];

        await masterPool.query(query, values);
        const [updated] = await masterPool.query('SELECT * FROM subjects WHERE id = ?', [id]);
        res.json({ success: true, message: 'Subject updated', data: updated[0] });
    } catch (error) {
        console.error('Error updating subject:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// DELETE subject
exports.deleteSubject = async (req, res) => {
    try {
        const { id } = req.params;
        const [existing] = await masterPool.query('SELECT id FROM subjects WHERE id = ?', [id]);
        if (existing.length === 0) {
            return res.status(404).json({ success: false, message: 'Subject not found' });
        }
        await masterPool.query('DELETE FROM subjects WHERE id = ?', [id]);
        res.json({ success: true, message: 'Subject deleted' });
    } catch (error) {
        console.error('Error deleting subject:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};
