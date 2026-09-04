const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  admissionNumber: { type: String, unique: true, sparse: true },
  fullName: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  dateOfBirth: { type: String, required: true },
  gender: { type: String, required: true },
  classApplyingFor: { type: String, required: true },
  parentFullName: { type: String, required: true },
  parentPhone: { type: String, required: true },
  parentEmail: { type: String },
  
  // Registration Status & Rejection Info
  status: {
    type: String,
    enum: ['PENDING', 'APPROVED', 'REJECTED'],
    default: 'PENDING'
  },
  rejectionReason: {
    type: String,
    default: null
  },
  rejectedAt: {
    type: Date,
    default: null
  },

  // Payment Details (Razorpay)
  registrationFee: {
    amount: { type: Number, default: 1000 },
    paymentStatus: { type: String, enum: ['UNPAID', 'PAID'], default: 'UNPAID' },
    razorpayOrderId: String,
    razorpayPaymentId: String,
    paidAt: Date
  },

  // Bank & UPI Details for Refund
  refundAccountDetails: {
    accountHolderName: { type: String, required: true, default: '' },
    bankName: { type: String },
    accountNumber: { type: String },
    ifscCode: { type: String },
    upiId: { type: String } // Optional: Agar student UPI se payout chahe
  },

  // Refund Lifecycle Tracking
  refund: {
    status: {
      type: String,
      enum: ['NOT_APPLICABLE', 'REQUESTED', 'PROCESSING', 'COMPLETED', 'FAILED'],
      default: 'NOT_APPLICABLE'
    },
    amount: { type: Number },
    transactionReference: { type: String, default: null }, // UTR / Payout Reference ID
    requestedAt: { type: Date, default: null },
    processedAt: { type: Date, default: null }
  }
}, { timestamps: true });

module.exports = mongoose.model('Student', studentSchema);