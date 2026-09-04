const User = require('../models/User');
const Student = require('../models/Student');
const Attendance = require('../models/Attendance');
const Homework = require('../models/Homework');
const Payroll = require('../models/Payroll');
const Leave = require('../models/Leave');

// @desc    Get students for attendance marking by class
// @route   GET /api/teacher/students/:className
exports.getStudentsByClass = async (req, res) => {
  try {
    const { className } = req.params;
    const students = await Student.find({ classApplyingFor: className, status: 'APPROVED' });

    const studentEmails = students.map((student) => student.email);
    const users = await User.find({ email: { $in: studentEmails } });

    const studentList = students.map((student) => {
      const user = users.find((u) => u.email === student.email);
      return {
        _id: user ? user._id : student._id,
        studentTableId: student._id,
        fullName: student.fullName,
        admissionNumber: student.admissionNumber,
        email: student.email,
        classApplyingFor: student.classApplyingFor
      };
    });

    res.json({ success: true, data: studentList });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Mark bulk attendance for class
// @route   POST /api/teacher/attendance
exports.markAttendance = async (req, res) => {
  try {
    const { date, attendanceData } = req.body;

    const records = await Promise.all(
      attendanceData.map(async (item) => {
        const normalizedDate = new Date(date);
        return Attendance.findOneAndUpdate(
          { student: item.studentId, date: normalizedDate },
          { student: item.studentId, date: normalizedDate, status: item.status },
          { upsert: true, new: true }
        );
      })
    );

    res.json({ success: true, message: 'Attendance marked successfully!', data: records });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Create homework / assignment
// @route   POST /api/teacher/homework
exports.createHomework = async (req, res) => {
  try {
    const { subject, title, description, className, dueDate } = req.body;

    const homework = await Homework.create({
      subject,
      title,
      description,
      className,
      dueDate,
      assignedBy: req.user?.name || 'Class Teacher'
    });

    res.status(201).json({ success: true, data: homework });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.applyLeave = async (req, res) => {
  try {
    const { leaveType, startDate, endDate, reason } = req.body;
    const leave = await Leave.create({
      teacher: req.user._id,
      teacherName: req.user.name,
      leaveType,
      startDate,
      endDate,
      reason
    });
    res.status(201).json({ success: true, message: 'Leave application submitted!', data: leave });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getMyLeaves = async (req, res) => {
  try {
    const leaves = await Leave.find({ teacher: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, data: leaves });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getMySalarySlips = async (req, res) => {
  try {
    const slips = await Payroll.find({ teacher: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, data: slips });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.generateSalary = async (req, res) => {
  try {
    const { teacherId, month, baseSalary, allowances, deductions } = req.body;
    const teacher = await User.findById(teacherId);
    if (!teacher) return res.status(404).json({ success: false, message: 'Teacher not found' });

    const netSalary = Number(baseSalary) + Number(allowances || 0) - Number(deductions || 0);

    const record = await Payroll.create({
      teacher: teacher._id,
      teacherName: teacher.name,
      teacherEmail: teacher.email,
      month,
      baseSalary: Number(baseSalary),
      allowances: Number(allowances || 0),
      deductions: Number(deductions || 0),
      netSalary,
      paymentStatus: 'PAID'
    });

    res.status(201).json({ success: true, message: 'Salary processed & disbursed successfully!', data: record });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getAllLeavesForAdmin = async (req, res) => {
  try {
    const leaves = await Leave.find().sort({ createdAt: -1 });
    res.json({ success: true, data: leaves });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateLeaveStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const updated = await Leave.findByIdAndUpdate(id, { status }, { new: true });
    res.json({ success: true, message: `Leave status updated to ${status}!`, data: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
