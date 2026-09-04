const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const User = require('../models/User');
const authMiddleware = require('../middlewares/authMiddleware');
const {
  getStudentsByClass,
  markAttendance,
  createHomework,
  applyLeave,
  getMyLeaves,
  generateSalary,
  getAllLeavesForAdmin,
  updateLeaveStatus
} = require('../controllers/teacherController');
const { protect, authorize } = require('../middlewares/authMiddleware');

// Teacher Core
router.get('/students/:className', protect, authorize('TEACHER', 'SUPER_ADMIN', 'SCHOOL_ADMIN', 'PRINCIPAL'), getStudentsByClass);
router.post('/attendance', protect, authorize('TEACHER', 'SUPER_ADMIN', 'SCHOOL_ADMIN', 'PRINCIPAL'), markAttendance);
router.post('/homework', protect, authorize('TEACHER', 'SUPER_ADMIN', 'SCHOOL_ADMIN', 'PRINCIPAL'), createHomework);

// Teacher Leaves & Salary
router.post('/leave/apply', protect, authorize('TEACHER'), applyLeave);
router.get('/leave/my', protect, authorize('TEACHER'), getMyLeaves);

// 1. Get Logged-in Teacher's Salary Slips
router.get('/salary/my', authMiddleware, async (req, res) => {
  try {
    const teacherId = req.user.id || req.user._id;
    const teacherEmail = req.user.email;

    const db = mongoose.connection.db;
    const salaryCollection = db.collection('salaries');

    const slips = await salaryCollection
      .find({
        $or: [
          { teacherId: new mongoose.Types.ObjectId(teacherId) },
          { teacherId: String(teacherId) },
          { teacherEmail: teacherEmail }
        ]
      })
      .sort({ paymentDate: -1 })
      .toArray();

    res.json({ success: true, data: slips });
  } catch (err) {
    console.error('Error fetching teacher salary:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// Admin / Principal Payroll
router.get('/all-teachers', protect, authorize('SUPER_ADMIN', 'SCHOOL_ADMIN', 'PRINCIPAL'), async (req, res) => {
  try {
    const teachers = await User.find({ role: 'TEACHER' }).select('-password');
    res.json({ success: true, data: teachers });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 2. Disburse Salary (Admin API)
router.post('/salary/disburse', async (req, res) => {
  try {
    const { teacherId, month, baseSalary, allowances, deductions } = req.body;

    const teacher = await User.findById(teacherId);
    if (!teacher) {
      return res.status(404).json({ success: false, message: 'Teacher not found' });
    }

    const base = Number(baseSalary) || 0;
    const allow = Number(allowances) || 0;
    const deduct = Number(deductions) || 0;
    const net = base + allow - deduct;

    const db = mongoose.connection.db;
    const salaryCollection = db.collection('salaries');

    await salaryCollection.insertOne({
      teacherId: teacher._id,
      teacherName: teacher.name,
      teacherEmail: teacher.email,
      month: month || 'August 2026',
      baseSalary: base,
      allowances: allow,
      deductions: deduct,
      netSalary: net,
      paymentStatus: 'APPROVED',
      paymentDate: new Date()
    });

    res.json({
      success: true,
      message: `Salary of ₹${net.toLocaleString()} disbursed successfully to ${teacher.name}`
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Principal / Admin Operations
router.post('/salary/generate', protect, authorize('SUPER_ADMIN', 'SCHOOL_ADMIN', 'PRINCIPAL'), generateSalary);
router.get('/leaves/all', protect, authorize('SUPER_ADMIN', 'SCHOOL_ADMIN', 'PRINCIPAL'), getAllLeavesForAdmin);
router.put('/leaves/status/:id', protect, authorize('SUPER_ADMIN', 'SCHOOL_ADMIN', 'PRINCIPAL'), updateLeaveStatus);

module.exports = router;
