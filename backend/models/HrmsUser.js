const mongoose = require('mongoose');

const hrmsUserSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String },
  employee_id: { type: mongoose.Schema.Types.ObjectId, ref: 'HrmsEmployee' },
  role: { type: String },
  isActive: { type: Boolean, default: true }
}, {
  collection: 'users', // Map to HRMS collection name
  timestamps: true,
  strict: false
});

module.exports = mongoose.model('HrmsUser', hrmsUserSchema);
