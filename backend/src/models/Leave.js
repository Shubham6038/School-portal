const mongoose = require('mongoose');

const leaveSchema = new mongoose.Schema({
  teacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  teacherName: { type: String, required: true },
  leaveType: {
    type: String,
    enum: ['CASUAL', 'SICK', 'EMERGENCY'],
    default: 'CASUAL'
  },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  reason: { type: String, required: true },
  status: {
    type: String,
    enum: ['PENDING', 'APPROVED', 'REJECTED'],
    default: 'PENDING'
  }
}, { timestamps: true });

module.exports = mongoose.model('Leave', leaveSchema);
