const express = require('express');
const router = express.Router();
const { registerUser, loginUser, registerTeacher } = require('../controllers/authController');
const { protect, authorize } = require('../middlewares/authMiddleware');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/register-teacher', protect, authorize('SUPER_ADMIN', 'SCHOOL_ADMIN', 'PRINCIPAL', 'ADMIN'), registerTeacher);

module.exports = router;