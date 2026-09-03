const Student = require('../models/Student');
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const Razorpay = require('razorpay');
const crypto = require('crypto');

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_dummyKey123',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'dummySecret123'
});

const generateAdmissionNumber = async () => {
  const count = await Student.countDocuments();
  const nextNumber = (count + 1).toString().padStart(4, '0');
  return `ADM-2026-${nextNumber}`;
};

exports.submitAdmission = async (req, res) => {
  try {
    console.log('submitAdmission called. req.body keys:', Object.keys(req.body));
    console.log('submitAdmission files:', Object.keys(req.files || {}));
    const admissionNumber = await generateAdmissionNumber();

    const options = {
      amount: 1000 * 100,
      currency: 'INR',
      receipt: `reg_${Date.now()}`
    };

    const order = await razorpay.orders.create(options);

    // Safely extract refund details whether they are flat or nested
    // Normalize possible array values (when duplicate form keys produce arrays)
    const normalize = (v) => Array.isArray(v) ? v[0] : v;

    const accountHolder =
      normalize(req.body.accountHolderName) ||
      normalize(req.body['refundAccountDetails[accountHolderName]']) ||
      normalize(req.body.parentFullName) ||
      normalize(req.body.fullName) || '';

    const bankName = normalize(req.body.bankName) || normalize(req.body['refundAccountDetails[bankName]']) || '';
    const accountNumber = normalize(req.body.accountNumber) || normalize(req.body['refundAccountDetails[accountNumber]']) || '';
    const ifscCode = normalize(req.body.ifscCode) || normalize(req.body['refundAccountDetails[ifscCode]']) || '';
    const upiId = normalize(req.body.upiId) || normalize(req.body['refundAccountDetails[upiId]']) || '';

    // Multer se aane wali files ke paths check karein (agar upload ho rahi hain)
    const passportPhotoPath = req.files?.passportPhoto ? req.files.passportPhoto[0].path : (req.body.passportPhoto || '');
    const aadharCardPath = req.files?.aadharCard ? req.files.aadharCard[0].path : (req.body.aadharCard || '');

    const student = await Student.create({
      fullName: req.body.fullName,
      email: req.body.email,
      phone: req.body.phone,
      dateOfBirth: req.body.dateOfBirth,
      gender: req.body.gender,
      classApplyingFor: req.body.classApplyingFor,
      parentFullName: req.body.parentFullName || req.body.parentName,
      parentPhone: req.body.parentPhone,
      parentEmail: req.body.parentEmail,
      refundAccountDetails: {
        accountHolderName: accountHolder,
        bankName,
        accountNumber,
        ifscCode,
        upiId
      },
      documents: {
        passportPhoto: passportPhotoPath,
        aadharCard: aadharCardPath
      },
      admissionNumber,
      registrationFee: {
        amount: 1000,
        paymentStatus: 'UNPAID',
        razorpayOrderId: order.id
      }
    });

    res.status(201).json({
      success: true,
      order,
      studentId: student._id,
      admissionNumber
    });
  } catch (err) {
    console.error('Admission Submission Error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.verifyRegistrationPayment = async (req, res) => {
  try {
    const { studentId, razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;

    const body = razorpayOrderId + '|' + razorpayPaymentId;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || 'dummySecret123')
      .update(body.toString())
      .digest('hex');

    if (expectedSignature === razorpaySignature) {
      const student = await Student.findById(studentId);
      if (!student) {
        return res.status(404).json({ success: false, message: 'Student record not found' });
      }

      student.registrationFee.paymentStatus = 'PAID';
      student.registrationFee.razorpayPaymentId = razorpayPaymentId;
      student.registrationFee.paidAt = new Date();
      await student.save();

      return res.json({ success: true, message: 'Registration Fee Paid & Admission Submitted Successfully!', data: student });
    }

    return res.status(400).json({ success: false, message: 'Payment verification failed!' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.applyAdmission = async (req, res) => {
  try {
    const { fullName, email, phone, dob, gender, classApplyingFor, parentName, parentPhone, parentEmail } = req.body;

    const admissionNumber = await generateAdmissionNumber();

    const newStudent = await Student.create({
      admissionNumber,
      fullName,
      email,
      phone,
      dateOfBirth: dob || '',
      gender,
      classApplyingFor,
      parentFullName: parentName,
      parentPhone,
      parentEmail,
      registrationFee: { amount: 1000, paymentStatus: 'UNPAID' }
    });

    res.status(201).json({
      success: true,
      message: 'Admission Application Submitted Successfully!',
      data: {
        admissionNumber: newStudent.admissionNumber,
        status: newStudent.status,
        fullName: newStudent.fullName
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.trackAdmission = async (req, res) => {
  try {
    const student = await Student.findOne({ admissionNumber: req.params.admissionNumber });
    if (!student) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

    res.json({
      success: true,
      data: {
        admissionNumber: student.admissionNumber,
        fullName: student.fullName,
        classApplyingFor: student.classApplyingFor,
        status: student.status
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getAllApplications = async (req, res) => {
  try {
    const students = await Student.find().sort({ createdAt: -1 });
    res.json({ success: true, data: students });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateAdmissionStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!['APPROVED', 'REJECTED'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Status must be APPROVED or REJECTED'
      });
    }

    const student = await Student.findById(req.params.id);

    if (!student) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

    student.status = status;
    await student.save();

    if (status === 'APPROVED') {
      const userExists = await User.findOne({ email: student.email });

      if (!userExists) {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('Student@123', salt);

        await User.create({
          name: student.fullName,
          email: student.email,
          password: hashedPassword,
          role: 'STUDENT',
          phone: student.phone,
          isActive: true
        });
      }
    }

    res.json({
      success: true,
      message: status === 'APPROVED' ? 'Admission Approved & Student Account Created!' : 'Admission Status Updated',
      data: student
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};