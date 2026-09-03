const express = require('express');
const router = express.Router();
const { createFeeOrder, verifyFeePayment, assignFee, getMyFees, getAllCollectedFees } = require('../controllers/feeController');
const { protect, authorize } = require('../middlewares/authMiddleware');

router.post('/assign', protect, authorize('SUPER_ADMIN', 'SCHOOL_ADMIN', 'ADMIN'), assignFee);
router.get('/my-fees', protect, getMyFees);
router.get('/all-collected', protect, authorize('SUPER_ADMIN', 'SCHOOL_ADMIN', 'ADMIN'), getAllCollectedFees);
router.post('/create-order', protect, createFeeOrder);
router.post('/verify-payment', protect, verifyFeePayment);

module.exports = router;
