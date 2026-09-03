const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: Date, required: true },
  status: { type: String, enum: ['PRESENT', 'ABSENT', 'LATE', 'LEAVE'], required: true }
}, { timestamps: true });

module.exports = mongoose.model('Attendance', attendanceSchema);
