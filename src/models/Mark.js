const mongoose = require('mongoose');

const markSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  admissionNumber: { type: String, required: true },
  studentName: { type: String, required: true },
  className: { type: String, required: true },
  examType: {
    type: String,
    enum: ['MID_TERM', 'FINAL_EXAM', 'UNIT_TEST_1', 'UNIT_TEST_2'],
    default: 'MID_TERM'
  },
  subjects: [
    {
      subjectName: { type: String, required: true },
      marksObtained: { type: Number, required: true },
      maxMarks: { type: Number, default: 100 }
    }
  ],
  totalMarksObtained: { type: Number, required: true },
  totalMaxMarks: { type: Number, required: true },
  percentage: { type: Number, required: true },
  grade: { type: String, required: true },
  remarks: { type: String, default: 'Good Performance' },
  approvalStatus: {
    type: String,
    enum: ['PENDING_APPROVAL', 'APPROVED', 'REJECTED'],
    default: 'PENDING_APPROVAL'
  },
  submittedBy: { type: String, default: 'Faculty Teacher' },
  approvedBy: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Mark', markSchema);
