const Student = require('../models/Student');
const User = require('../models/User');
const Attendance = require('../models/Attendance');
const Homework = require('../models/Homework');
const Fee = require('../models/Fee');
const Mark = require('../models/Mark');

// @desc    Get Linked Child Information for Parent
// @route   GET /api/parent/child-data
// @access  Parent / User
exports.getChildData = async (req, res) => {
  try {
    const studentApp = await Student.findOne({
      $or: [{ parentEmail: req.user.email }, { email: req.user.email }]
    });

    if (!studentApp) {
      return res.status(404).json({ success: false, message: 'No linked child record found.' });
    }

    const studentUser = await User.findOne({ email: studentApp.email });

    const attendanceRecords = studentUser ? await Attendance.find({ student: studentUser._id }).sort({ date: -1 }) : [];
    const totalDays = attendanceRecords.length;
    const presentDays = attendanceRecords.filter((a) => a.status === 'PRESENT').length;
    const attendancePercentage = totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 100;

    const homework = await Homework.find({ className: studentApp.classApplyingFor }).sort({ createdAt: -1 });
    const fees = await Fee.find({ admissionNumber: studentApp.admissionNumber }).sort({ createdAt: -1 });
    const reportCards = studentUser ? await Mark.find({ student: studentUser._id, approvalStatus: 'APPROVED' }).sort({ createdAt: -1 }) : [];

    res.json({
      success: true,
      data: {
        child: {
          fullName: studentApp.fullName,
          admissionNumber: studentApp.admissionNumber,
          className: studentApp.classApplyingFor,
          fatherName: studentApp.parentFullName || 'N/A',
          motherName: studentApp.motherName || 'N/A',
          phone: studentApp.phone || studentApp.parentPhone || 'N/A'
        },
        analytics: {
          attendancePercentage,
          totalDays,
          presentDays,
          absentDays: totalDays - presentDays
        },
        attendanceRecords,
        homework,
        fees,
        reportCards
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
