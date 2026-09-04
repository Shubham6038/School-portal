const mongoose = require('mongoose');

const payrollSchema = new mongoose.Schema({
  teacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  teacherName: { type: String, required: true },
  teacherEmail: { type: String, required: true },
  month: { type: String, required: true },
  baseSalary: { type: Number, required: true },
  allowances: { type: Number, default: 0 },
  deductions: { type: Number, default: 0 },
  netSalary: { type: Number, required: true },
  paymentStatus: {
    type: String,
    enum: ['PAID', 'PENDING'],
    default: 'PAID'
  },
  paymentDate: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Payroll', payrollSchema);
