const express = require('express');
const router = express.Router();
const {
  submitMarks,
  getPendingMarksForAdmin,
  updateMarkStatus,
  getMyResults
} = require('../controllers/examController');
const { protect, authorize } = require('../middlewares/authMiddleware');

router.post('/submit-marks', protect, authorize('TEACHER', 'SUPER_ADMIN', 'SCHOOL_ADMIN'), submitMarks);
router.get('/pending-admin', protect, authorize('SUPER_ADMIN', 'SCHOOL_ADMIN', 'ADMIN'), getPendingMarksForAdmin);
router.put('/status/:id', protect, authorize('SUPER_ADMIN', 'SCHOOL_ADMIN', 'ADMIN'), updateMarkStatus);
router.get('/my-results', protect, authorize('STUDENT'), getMyResults);

module.exports = router;
