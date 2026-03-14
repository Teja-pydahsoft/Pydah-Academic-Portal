const { masterPool } = require('../config/database');
const HrmsEmployee = require('../models/HrmsEmployee');

async function validateFacultyWorkload(subject_id, batch, day_of_week, period_slot_id, current_entry_id = null) {
    if (!subject_id) return { valid: true };

    const [assignedFaculties] = await masterPool.query(
        'SELECT employee_id FROM faculty_subjects WHERE subject_id = ? AND (batch = ? OR (batch IS NULL AND ? IS NULL))',
        [subject_id, batch || null, batch || null]
    );

    if (assignedFaculties.length === 0) return { valid: true };

    const employeeIds = assignedFaculties.map(f => f.employee_id);
    const employees = await HrmsEmployee.find({ _id: { $in: employeeIds } }).select('name');
    const empNames = {};
    employees.forEach(e => empNames[e._id.toString()] = e.name);

    for (let empId of employeeIds) {
        const [empSubjects] = await masterPool.query(
            'SELECT subject_id, batch FROM faculty_subjects WHERE employee_id = ?', 
            [empId]
        );

        if (empSubjects.length === 0) continue;

        const conditions = empSubjects.map(es => 
            `(t.subject_id = ${es.subject_id} AND ${es.batch ? `t.batch = '${es.batch}'` : 't.batch IS NULL'})`
        ).join(' OR ');

        let excludeCurrent = current_entry_id ? `AND t.id != ${current_entry_id}` : '';

        const [empSlots] = await masterPool.query(`
            SELECT t.day_of_week, t.period_slot_id 
            FROM timetable_entries t
            WHERE (${conditions}) ${excludeCurrent}
        `);

        const overlap = empSlots.find(es => es.day_of_week === day_of_week && es.period_slot_id === period_slot_id);
        if (overlap) {
            return { valid: false, message: `Overlap error: ${empNames[empId] || 'Assigned faculty'} already has a class on ${day_of_week} during this slot` };
        }

        let dayCount = 1;
        empSlots.forEach(slot => {
            if (slot.day_of_week === day_of_week) dayCount++;
        });

        if (dayCount > 7) {
            return { valid: false, message: `Workload limit exceeded: ${empNames[empId] || 'Assigned faculty'} would have ${dayCount} hours on ${day_of_week} (Max 7 hours)` };
        }
    }

    return { valid: true };
}

// GET timetable entries based on filters
exports.getTimetable = async (req, res) => {
    try {
        const { branch_id, batch, year_of_study, semester_number } = req.query;

        // Build where clause
        let whereClause = 'WHERE 1=1';
        const queryParams = [];

        if (branch_id) {
            whereClause += ' AND t.branch_id = ?';
            queryParams.push(branch_id);
        }
        if (batch) {
            whereClause += ' AND t.batch = ?';
            queryParams.push(batch);
        }
        if (year_of_study) {
            whereClause += ' AND t.year_of_study = ?';
            queryParams.push(year_of_study);
        }
        if (semester_number) {
            whereClause += ' AND t.semester_number = ?';
            queryParams.push(semester_number);
        }

        const query = `
            SELECT t.*, 
                   s.name as subject_name, s.code as subject_code, s.subject_type,
                   p.start_time, p.end_time, p.is_break, p.name as slot_name
            FROM timetable_entries t
            LEFT JOIN subjects s ON t.subject_id = s.id
            LEFT JOIN period_slots p ON t.period_slot_id = p.id
            ${whereClause}
            ORDER BY t.day_of_week, p.start_time
        `;

        const [rows] = await masterPool.query(query, queryParams);
        res.json({ success: true, data: rows });
    } catch (error) {
        console.error('Error fetching timetable:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// POST new timetable entry
exports.createTimetableEntry = async (req, res) => {
    try {
        const { branch_id, batch, year_of_study, semester_number, day_of_week, period_slot_id, subject_id, type, custom_label, span } = req.body;

        if (!branch_id || !year_of_study || !semester_number || !day_of_week || !period_slot_id || !type) {
            return res.status(400).json({ success: false, message: 'Missing required fields for timetable entry' });
        }

        const validCheck = await validateFacultyWorkload(subject_id, batch, day_of_week, period_slot_id, null);
        if (!validCheck.valid) {
            return res.status(400).json({ success: false, message: validCheck.message });
        }

        const query = `
            INSERT INTO timetable_entries 
            (branch_id, batch, year_of_study, semester_number, day_of_week, period_slot_id, subject_id, type, custom_label, span) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        const values = [
            branch_id,
            batch || null,
            year_of_study,
            semester_number,
            day_of_week,
            period_slot_id,
            subject_id || null,
            type,
            custom_label || null,
            span || 1
        ];

        const [result] = await masterPool.query(query, values);
        const [newEntry] = await masterPool.query('SELECT * FROM timetable_entries WHERE id = ?', [result.insertId]);

        res.status(201).json({ success: true, message: 'Timetable entry created', data: newEntry[0] });
    } catch (error) {
        console.error('Error creating timetable entry:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// PUT update timetable entry
exports.updateTimetableEntry = async (req, res) => {
    try {
        const { id } = req.params;
        const { subject_id, type, custom_label, span } = req.body;

        const checkQuery = 'SELECT id FROM timetable_entries WHERE id = ?';
        const [existing] = await masterPool.query(checkQuery, [id]);

        if (existing.length === 0) {
            return res.status(404).json({ success: false, message: 'Timetable entry not found' });
        }

        // To validate properly, we need the day_of_week and period_slot_id which might not be in req.body.
        // Let's assume day_of_week and period_slot are fixed or passed. If they aren't, load them.
        const [currentEntry] = await masterPool.query('SELECT day_of_week, period_slot_id, batch FROM timetable_entries WHERE id = ?', [id]);
        
        const validCheck = await validateFacultyWorkload(subject_id, currentEntry[0].batch, currentEntry[0].day_of_week, currentEntry[0].period_slot_id, id);
        if (!validCheck.valid) {
            return res.status(400).json({ success: false, message: validCheck.message });
        }

        const query = `
            UPDATE timetable_entries SET 
                subject_id = ?,
                type = ?,
                custom_label = ?,
                span = ?
            WHERE id = ?
        `;

        const values = [
            subject_id || null,
            type,
            custom_label || null,
            span || 1,
            id
        ];

        await masterPool.query(query, values);
        const [updatedEntry] = await masterPool.query('SELECT * FROM timetable_entries WHERE id = ?', [id]);

        res.json({ success: true, message: 'Timetable entry updated', data: updatedEntry[0] });
    } catch (error) {
        console.error('Error updating timetable entry:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// DELETE timetable entry
exports.deleteTimetableEntry = async (req, res) => {
    try {
        const { id } = req.params;

        const checkQuery = 'SELECT id FROM timetable_entries WHERE id = ?';
        const [existing] = await masterPool.query(checkQuery, [id]);

        if (existing.length === 0) {
            return res.status(404).json({ success: false, message: 'Timetable entry not found' });
        }

        await masterPool.query('DELETE FROM timetable_entries WHERE id = ?', [id]);
        res.json({ success: true, message: 'Timetable entry deleted successfully' });
    } catch (error) {
        console.error('Error deleting timetable entry:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};
