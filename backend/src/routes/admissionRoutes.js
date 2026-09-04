const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middlewares/authMiddleware');
const multer = require('multer');
const path = require('path');

// Multer setup for handling multipart/form-data uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '..', '..', 'uploads'));
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}-${file.fieldname}${ext}`);
  }
});

const upload = multer({ storage });
const {
  submitAdmission,
  verifyRegistrationPayment,
  applyAdmission,
  trackAdmission,
  getAllApplications,
  updateAdmissionStatus,
} = require('../controllers/admissionController');

// 1. Dashboard Stats Route
router.get('/dashboard-stats', async (req, res) => {
  try {
    const User = require('../models/User');
    const Fee = require('../models/Fee');
    const Student = require('../models/Student');

    const totalStudents = await User.countDocuments({ role: 'STUDENT' });

    let activeApplications = 0;
    try {
      activeApplications = await Student.countDocuments({ status: 'PENDING' });
    } catch (e) {
      activeApplications = 0;
    }

    const feesPaid = await Fee.find({ status: 'PAID' });
    const totalFeeCollected = feesPaid.reduce((sum, f) => sum + (f.amount || 0), 0);
    const attendancePercentage = 100;

    res.json({
      success: true,
      stats: {
        totalStudents,
        activeApplications,
        attendancePercentage,
        totalFeeCollected,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 2. Student Admission Application & Tracking Routes
// Accept multipart/form-data with `passportPhoto` and `aadharCard` fields
router.post('/submit', upload.fields([{ name: 'passportPhoto' }, { name: 'aadharCard' }]), submitAdmission);
router.post('/verify-payment', verifyRegistrationPayment);
router.post('/apply', applyAdmission);
router.get('/track/:admissionNumber', trackAdmission);

// 3. Admin: Admission Applications & Status Updates
router.get(
  '/applications',
  protect,
  authorize('SUPER_ADMIN', 'SCHOOL_ADMIN', 'PRINCIPAL'),
  getAllApplications
);

router.put(
  '/status/:id',
  protect,
  authorize('SUPER_ADMIN', 'SCHOOL_ADMIN', 'PRINCIPAL'),
  updateAdmissionStatus
);

// 4. Admin: Get All Rejected Students (For Refund Panel)
router.get(
  '/rejected-students',
  protect,
  authorize('SUPER_ADMIN', 'SCHOOL_ADMIN', 'PRINCIPAL'),
  async (req, res) => {
    try {
      const Student = require('../models/Student');
      const rejectedStudents = await Student.find({ status: 'REJECTED' }).sort({ updatedAt: -1 });
      res.json({ success: true, data: rejectedStudents });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
);

// 5. Admin: Mark Refund as Processed / Completed
router.put(
  '/refund-complete/:id',
  protect,
  authorize('SUPER_ADMIN', 'SCHOOL_ADMIN', 'PRINCIPAL'),
  async (req, res) => {
    try {
      const Student = require('../models/Student');
      const { transactionReference, refundAmount } = req.body;

      if (!transactionReference) {
        return res.status(400).json({ success: false, message: 'Bank Reference / UTR ID is required' });
      }

      const student = await Student.findById(req.params.id);
      if (!student) {
        return res.status(404).json({ success: false, message: 'Student record not found' });
      }

      student.refund.status = 'COMPLETED';
      student.refund.transactionReference = transactionReference;
      student.refund.amount = refundAmount || student.registrationFee?.amount || 1000;
      student.refund.processedAt = new Date();

      await student.save();

      res.json({
        success: true,
        message: 'Refund marked as completed successfully',
        data: student
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
);

module.exports = router;