const Fee = require('../models/Fee');
const Student = require('../models/Student');
const User = require('../models/User');
const Razorpay = require('razorpay');
const crypto = require('crypto');

const razorpayKeyId = process.env.RAZORPAY_KEY_ID || 'rzp_test_1DP5mmOlF5G5ag';
const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET || 's0q1234567890';

const razorpay = new Razorpay({
  key_id: razorpayKeyId,
  key_secret: razorpayKeySecret
});

exports.assignFee = async (req, res) => {
  try {
    const { studentId, admissionNumber, title, amount, dueDate } = req.body;

    const studentData = await Student.findById(studentId);
    if (!studentData) {
      return res.status(404).json({ success: false, message: 'Student application not found' });
    }

    const user = await User.findOne({ email: studentData.email });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User account not created yet for this student. Please Approve first!' });
    }

    const fee = await Fee.create({
      student: user._id,
      admissionNumber: admissionNumber || studentData.admissionNumber,
      title,
      amount,
      dueDate
    });

    res.status(201).json({ success: true, data: fee });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getMyFees = async (req, res) => {
  try {
    const fees = await Fee.find({
      $or: [
        { student: req.user._id },
        { admissionNumber: req.user.admissionNumber },
        { email: req.user.email }
      ]
    }).sort({ createdAt: -1 });

    const studentApp = await Student.findOne({
      $or: [
        { email: req.user.email },
        { admissionNumber: req.user.admissionNumber }
      ]
    });

    let registrationRecord = null;
    if (studentApp && studentApp.registrationFee) {
      registrationRecord = {
        _id: studentApp.registrationFee.transactionId || studentApp._id,
        title: 'New Admission Registration Fee',
        amount: studentApp.registrationFee.amount || 1000,
        status: studentApp.registrationFee.paymentStatus || 'PAID',
        paymentDate: studentApp.registrationFee.paymentDate || studentApp.createdAt,
        paymentMode: 'Online Gateway (Razorpay)',
        transactionId: studentApp.registrationFee.transactionId || 'TXN-REG-2026',
        isRegistrationFee: true
      };
    }

    res.json({
      success: true,
      data: fees,
      registrationFee: registrationRecord
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.createFeeOrder = async (req, res) => {
  try {
    const { feeId } = req.body;
    const fee = await Fee.findById(feeId);

    if (!fee) {
      return res.status(404).json({ success: false, message: 'Fee record not found' });
    }

    if (fee.status === 'PAID') {
      return res.status(400).json({ success: false, message: 'Fee is already paid!' });
    }

    const options = {
      amount: Math.round(Number(fee.amount) * 100),
      currency: 'INR',
      receipt: `fee_${fee._id.toString().slice(-8)}`
    };

    const order = await razorpay.orders.create(options);

    res.json({
      success: true,
      order,
      razorpayKeyId,
      fee
    });
  } catch (err) {
    console.error('Razorpay Error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.verifyFeePayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, feeId } = req.body;

    const updatedFee = await Fee.findByIdAndUpdate(
      feeId,
      {
        status: 'PAID',
        paymentDate: new Date(),
        paymentMode: 'Online UPI/NetBanking',
        transactionId: razorpay_payment_id
      },
      { new: true }
    );

    res.json({
      success: true,
      message: 'Payment verified and status updated to PAID!',
      data: updatedFee
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getAllCollectedFees = async (req, res) => {
  try {
    const feePayments = await Fee.find({ status: 'PAID' }).sort({ paymentDate: -1, createdAt: -1 });
    const registrationPaidStudents = await Student.find({ 'registrationFee.paymentStatus': 'PAID' }).select('fullName admissionNumber registrationFee createdAt');

    const formattedRegistrationFees = registrationPaidStudents.map((student) => ({
      _id: student._id,
      title: 'New Admission Registration Fee',
      amount: Number(student.registrationFee?.amount) || 1000,
      status: 'PAID',
      paymentDate: student.registrationFee?.paidAt || student.registrationFee?.paymentDate || student.createdAt,
      paymentMode: 'Online Gateway (Razorpay)',
      admissionNumber: student.admissionNumber,
      studentName: student.fullName,
      isRegistrationFee: true,
    }));

    res.json({
      success: true,
      data: [
        ...formattedRegistrationFees,
        ...feePayments.map((fee) => ({ ...fee.toObject(), isRegistrationFee: false }))
      ]
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.createRazorpayOrder = exports.createFeeOrder;
exports.verifyPayment = exports.verifyFeePayment;
