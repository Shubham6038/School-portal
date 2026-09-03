const express = require('express');
const router = express.Router();
const { getStudentAcademicData, getNotices } = require('../controllers/academicController');
const { protect } = require('../middlewares/authMiddleware');

router.get('/student-dashboard-data', protect, getStudentAcademicData);
router.get('/notices', protect, getNotices);

module.exports = router;
