const mongoose = require('mongoose');
const HrmsEmployee = require('../models/HrmsEmployee');

exports.getEmployees = async (req, res) => {
    try {
        const { q } = req.query;
        let query = { is_active: true };

        if (q) {
            query.$or = [
                { employee_name: { $regex: q, $options: 'i' } },
                { email: { $regex: q, $options: 'i' } },
                // Check if they store custom emp ids
                { emp_no: { $regex: q, $options: 'i' } },
                { _id: mongoose.Types.ObjectId.isValid(q) ? q : null }
            ].filter(cond => Object.values(cond)[0] !== null);
        }

        const employees = await HrmsEmployee.find(query)
            .select('_id employee_name email department designation emp_no')
            .limit(50) // limit results so it's not returning thousands at once
            .sort({ employee_name: 1 });
            
        // The DB stores department as a JSON string
        const parsedEmployees = employees.map(emp => {
            let deptName = emp.department;
            try {
                if (typeof emp.department === 'string' && emp.department.startsWith('{')) {
                    deptName = JSON.parse(emp.department).name || emp.department;
                }
            } catch (e) {}

            return {
                _id: emp._id,
                emp_no: emp.emp_no,
                employee_name: emp.employee_name,
                email: emp.email,
                department: deptName,
                designation: emp.designation
            };
        });
            
        res.json({ success: true, data: parsedEmployees });
    } catch (error) {
        console.error('Error fetching HRMS employees:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch HRMS employees', error: error.message });
    }
};
