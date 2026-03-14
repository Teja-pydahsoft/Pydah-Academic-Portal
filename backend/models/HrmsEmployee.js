const mongoose = require('mongoose');

const hrmsEmployeeSchema = new mongoose.Schema({
  // Mongoose will automatically map _id to ObjectId
  employee_name: { type: String, required: true },
  email: { type: String },
  designation: { type: String },
  department: { type: String },
  emp_no: { type: String },
  is_active: { type: Boolean, default: true }
}, {
  collection: 'employees', // Map to HRMS collection name
  timestamps: true,
  strict: false // Allow taking other fields if present without schema error
});

module.exports = mongoose.model('HrmsEmployee', hrmsEmployeeSchema);
