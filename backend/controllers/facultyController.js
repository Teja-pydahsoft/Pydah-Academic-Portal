const { masterPool } = require('../config/database');
const bcrypt = require('bcryptjs');

exports.getAllFaculty = async (req, res) => {
    try {
        const [rows] = await masterPool.query(`
            SELECT id, name, username, email, role, phone, is_active, created_at, college_ids, course_ids, branch_ids, all_courses, all_branches 
            FROM rbac_users 
            WHERE is_active = 1 
            ORDER BY created_at DESC
        `);
        res.json({ success: true, data: rows });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.createFaculty = async (req, res) => {
    try {
        const { name, email, username, password, role, phone, college_ids, course_ids, branch_ids, all_courses, all_branches } = req.body;

        if (!name || !username || !password || !role) {
            return res.status(400).json({ success: false, message: 'Missing required fields' });
        }

        // Check if username or email already exists
        const [existing] = await masterPool.query(
            'SELECT id FROM rbac_users WHERE username = ? OR email = ?',
            [username, email]
        );

        if (existing.length > 0) {
            return res.status(409).json({ success: false, message: 'Username or email already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const [result] = await masterPool.query(
            `INSERT INTO rbac_users (name, email, username, password, role, phone, is_active, created_at, college_ids, course_ids, branch_ids, all_courses, all_branches) 
             VALUES (?, ?, ?, ?, ?, ?, 1, NOW(), ?, ?, ?, ?, ?)`,
            [
                name,
                email || null,
                username,
                hashedPassword,
                role,
                phone || null,
                JSON.stringify(college_ids || []),
                JSON.stringify(course_ids || []),
                JSON.stringify(branch_ids || []),
                all_courses ? 1 : 0,
                all_branches ? 1 : 0
            ]
        );

        res.status(201).json({
            success: true,
            message: 'User created successfully',
            data: { id: result.insertId, name, username, role }
        });
    } catch (error) {
        console.error('Create user error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.updateFaculty = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, email, username, role, phone, college_ids, course_ids, branch_ids, is_active, password, all_courses, all_branches } = req.body;

        let query = `UPDATE rbac_users SET name=?, email=?, username=?, role=?, phone=?, college_ids=?, course_ids=?, branch_ids=?, all_courses=?, all_branches=?, is_active=?`;
        let params = [
            name,
            email || null,
            username,
            role,
            phone || null,
            JSON.stringify(college_ids || []),
            JSON.stringify(course_ids || []),
            JSON.stringify(branch_ids || []),
            all_courses ? 1 : 0,
            all_branches ? 1 : 0,
            is_active !== undefined ? is_active : 1
        ];

        if (password) {
            const hashedPassword = await bcrypt.hash(password, 10);
            query += `, password=?`;
            params.push(hashedPassword);
        }

        query += ` WHERE id=?`;
        params.push(id);

        await masterPool.query(query, params);

        res.json({ success: true, message: 'User updated successfully' });
    } catch (error) {
        console.error('Update user error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.deleteFaculty = async (req, res) => {
    try {
        const { id } = req.params;
        await masterPool.query('UPDATE rbac_users SET is_active=0 WHERE id=?', [id]);
        res.json({ success: true, message: 'User deactivated successfully' });
    } catch (error) {
        console.error('Delete user error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};
