const Mark = require('../models/Mark');
const Student = require('../models/Student');
const User = require('../models/User');

const calculateGrade = (percentage) => {
  if (percentage >= 90) return 'A+';
  if (percentage >= 80) return 'A';
  if (percentage >= 70) return 'B+';
  if (percentage >= 60) return 'B';
  if (percentage >= 50) return 'C';
  if (percentage >= 33) return 'D';
  return 'F (Fail)';
};

exports.submitMarks = async (req, res) => {
  try {
    const { studentId, examType, className, subjects, remarks } = req.body;

    const user = await User.findById(studentId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    const studentApp = await Student.findOne({ email: user.email });

    let totalObtained = 0;
    let totalMax = 0;

    subjects.forEach((sub) => {
      totalObtained += Number(sub.marksObtained);
      totalMax += Number(sub.maxMarks || 100);
    });

    const percentage = Math.round((totalObtained / totalMax) * 100);
    const grade = calculateGrade(percentage);

    const markRecord = await Mark.findOneAndUpdate(
      { student: studentId, examType },
      {
        student: studentId,
        admissionNumber: studentApp ? studentApp.admissionNumber : 'ADM-2026',
        studentName: user.name,
        className,
        examType,
        subjects,
        totalMarksObtained: totalObtained,
        totalMaxMarks: totalMax,
        percentage,
        grade,
        remarks: remarks || 'Good Performance',
        approvalStatus: 'PENDING_APPROVAL',
        submittedBy: req.user.name || 'Faculty'
      },
      { upsert: true, new: true }
    );

    res.status(200).json({
      success: true,
      message: 'Marks submitted successfully and sent to Admin for approval!',
      data: markRecord
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getPendingMarksForAdmin = async (req, res) => {
  try {
    const records = await Mark.find().sort({ createdAt: -1 });
    res.json({ success: true, data: records });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateMarkStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const mark = await Mark.findByIdAndUpdate(
      id,
      { approvalStatus: status, approvedBy: req.user.name },
      { new: true }
    );

    if (!mark) {
      return res.status(404).json({ success: false, message: 'Record not found' });
    }

    res.json({ success: true, message: `Marks status updated to ${status}!`, data: mark });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getMyResults = async (req, res) => {
  try {
    const results = await Mark.find({
      student: req.user._id,
      approvalStatus: 'APPROVED'
    }).sort({ createdAt: -1 });

    res.json({ success: true, data: results });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
