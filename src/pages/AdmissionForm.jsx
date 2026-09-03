import React, { useState } from 'react';
import API from '../api/axios';
import { Link } from 'react-router-dom';
import { School, ArrowLeft, CheckCircle2, Landmark, Upload } from 'lucide-react';

export default function AdmissionForm() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    gender: 'Male',
    classApplyingFor: 'Class 1',
    parentFullName: '',
    parentPhone: '',
    parentEmail: '',
    // Refund Account Fields
    accountHolderName: '',
    bankName: '',
    accountNumber: '',
    ifscCode: '',
    upiId: '',
  });

  // Document Files State
  const [files, setFiles] = useState({
    passportPhoto: null,
    aadharCard: null
  });

  const [submittedData, setSubmittedData] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // FormData ka use karenge kyunki ab files (images/PDF) bhi send ho rahi hain
      const data = new FormData();
      // Append non-refund fields first. Skip refund-related keys to avoid duplicates.
      const refundKeys = ['accountHolderName', 'bankName', 'accountNumber', 'ifscCode', 'upiId'];
      Object.keys(formData).forEach((key) => {
        if (!refundKeys.includes(key)) data.append(key, formData[key]);
      });

      // Send as flat keys to prevent undefined property errors on the backend
      data.append('accountHolderName', formData.accountHolderName || formData.parentFullName || formData.fullName);
      data.append('bankName', formData.bankName);
      data.append('accountNumber', formData.accountNumber);
      data.append('ifscCode', formData.ifscCode);
      data.append('upiId', formData.upiId);

      // Append files
      if (files.passportPhoto) data.append('passportPhoto', files.passportPhoto);
      if (files.aadharCard) data.append('aadharCard', files.aadharCard);

      const res = await API.post('/admissions/submit', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      const { order, studentId, admissionNumber } = res.data;

      const options = {
        key: 'rzp_test_TM0CNZaCzNldin',
        amount: order.amount,
        currency: order.currency,
        name: 'AB PUBLIC SCHOOL',
        description: 'Mandatory Admission Registration Fee',
        order_id: order.id,
        handler: async function (response) {
          try {
            await API.post('/admissions/verify-payment', {
              studentId,
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            });

            setSubmittedData({ admissionNumber, name: formData.fullName });
          } catch (err) {
            alert('Payment verification failed. Please contact school admin.');
          }
        },
        prefill: {
          name: formData.fullName,
          email: formData.email,
          contact: formData.phone,
        },
        theme: { color: '#1d4ed8' },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      alert(err.response?.data?.message || 'Form submission failed');
    } finally {
      setLoading(false);
    }
  };

  if (submittedData) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 text-white">
        <div className="bg-slate-900 border border-blue-900/40 p-8 rounded-3xl text-center max-w-md w-full shadow-2xl">
          <div className="w-16 h-16 bg-emerald-500/10 text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-500/20 text-2xl font-bold">
            ✓
          </div>
          <h2 className="text-2xl font-bold mb-2">Admission Application Confirmed!</h2>
          <p className="text-slate-400 text-sm mb-4">
            Registration Fee Payment of ₹1,000 Received for <strong>AB PUBLIC SCHOOL</strong>.
          </p>
          <div className="bg-slate-950 p-4 rounded-xl border border-blue-900/40 text-amber-400 font-mono font-bold text-lg mb-6">
            {submittedData.admissionNumber}
          </div>
          <Link to="/login" className="inline-block px-6 py-2.5 bg-blue-600 hover:bg-blue-500 font-bold rounded-xl text-xs">
            Proceed to Login Portal
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6">
      <div className="max-w-5xl mx-auto">
        <Link to="/login" className="inline-flex items-center gap-2 text-blue-400 hover:text-amber-400 mb-6 text-sm font-semibold transition-colors">
          <ArrowLeft className="h-4 w-4" />
          Back to Login
        </Link>

        <div className="bg-slate-900 border border-blue-900/40 rounded-3xl overflow-hidden shadow-2xl">
          <div className="p-8 border-b border-slate-800 bg-slate-900/80 flex items-center gap-4">
            <div className="bg-blue-600/10 border border-blue-500/30 p-3.5 rounded-2xl text-amber-400">
              <School className="h-8 w-8" />
            </div>
            <div>
              <span className="text-xs text-amber-400 font-bold uppercase tracking-widest">Academic Session 2026-27</span>
              <h1 className="text-2xl font-black tracking-wide">AB PUBLIC SCHOOL - ADMISSION FORM</h1>
              <p className="text-xs text-slate-400 mt-0.5">Online Registration Fee: ₹1,000 (Payable via UPI, NetBanking, Card)</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Student Basic Information */}
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase mb-2">Student Full Name</label>
              <input
                type="text"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 rounded-xl p-3 text-sm outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase mb-2">Email Address</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 rounded-xl p-3 text-sm outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase mb-2">Phone Number</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 rounded-xl p-3 text-sm outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase mb-2">Date of Birth</label>
              <input
                type="date"
                value={formData.dateOfBirth}
                onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 rounded-xl p-3 text-sm outline-none text-slate-300"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase mb-2">Gender</label>
              <select
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 rounded-xl p-3 text-sm outline-none"
              >
                <option>Male</option>
                <option>Female</option>
                <option>Other</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase mb-2">Class Applying For</label>
              <select
                value={formData.classApplyingFor}
                onChange={(e) => setFormData({ ...formData, classApplyingFor: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 rounded-xl p-3 text-sm outline-none"
              >
                <option>Class 1</option>
                <option>Class 2</option>
                <option>Class 3</option>
                <option>Class 4</option>
                <option>Class 5</option>
                <option>Class 10</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase mb-2">Parent / Guardian Full Name</label>
              <input
                type="text"
                value={formData.parentFullName}
                onChange={(e) => setFormData({ ...formData, parentFullName: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 rounded-xl p-3 text-sm outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase mb-2">Parent Contact Number</label>
              <input
                type="tel"
                value={formData.parentPhone}
                onChange={(e) => setFormData({ ...formData, parentPhone: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 rounded-xl p-3 text-sm outline-none"
                required
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-300 uppercase mb-2">Parent Email Address</label>
              <input
                type="email"
                value={formData.parentEmail}
                onChange={(e) => setFormData({ ...formData, parentEmail: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 rounded-xl p-3 text-sm outline-none"
              />
            </div>

            {/* Document Upload Section (Passport Photo & Aadhar Card) */}
            <div className="md:col-span-2 bg-slate-950/70 border border-blue-500/20 p-5 rounded-2xl mt-2">
              <div className="flex items-center gap-2 mb-1 text-blue-400 font-bold text-sm">
                <Upload className="h-4 w-4" />
                <span>Upload Student Documents</span>
              </div>
              <p className="text-xs text-slate-400 mb-4">Please upload a passport size photo and Aadhar card document.</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase mb-2">Passport Size Photo *</label>
                  <input
                    type="file"
                    accept="image/*"
                    required
                    onChange={(e) => setFiles({ ...files, passportPhoto: e.target.files[0] })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-300 file:mr-4 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase mb-2">Aadhar Card *</label>
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    required
                    onChange={(e) => setFiles({ ...files, aadharCard: e.target.files[0] })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-300 file:mr-4 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Refund Account Details Section */}
            <div className="md:col-span-2 bg-slate-950/70 border border-amber-500/20 p-5 rounded-2xl mt-2">
              <div className="flex items-center gap-2 mb-1 text-amber-400 font-bold text-sm">
                <Landmark className="h-4 w-4" />
                <span>Bank / UPI Details (Mandatory for Refund Policy)</span>
              </div>
              <p className="text-xs text-slate-400 mb-4">
                In the event of application rejection, the ₹1,000 registration fee will be credited to this account.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase mb-2">Account Holder Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="Name as per bank account"
                    value={formData.accountHolderName}
                    onChange={(e) => setFormData({ ...formData, accountHolderName: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 focus:border-blue-500 rounded-xl p-3 text-sm outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase mb-2">UPI ID (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. name@okhdfcbank"
                    value={formData.upiId}
                    onChange={(e) => setFormData({ ...formData, upiId: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 focus:border-blue-500 rounded-xl p-3 text-sm outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase mb-2">Bank Name</label>
                  <input
                    type="text"
                    placeholder="e.g. State Bank of India"
                    value={formData.bankName}
                    onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 focus:border-blue-500 rounded-xl p-3 text-sm outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase mb-2">Account Number</label>
                  <input
                    type="text"
                    placeholder="Bank Account Number"
                    value={formData.accountNumber}
                    onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 focus:border-blue-500 rounded-xl p-3 text-sm outline-none"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-slate-300 uppercase mb-2">IFSC Code</label>
                  <input
                    type="text"
                    placeholder="e.g. SBIN0001234"
                    value={formData.ifscCode}
                    onChange={(e) => setFormData({ ...formData, ifscCode: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 focus:border-blue-500 rounded-xl p-3 text-sm outline-none uppercase"
                  />
                </div>
              </div>
            </div>

            <div className="md:col-span-2 flex justify-end pt-4">
              <button
                type="submit"
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-500 text-white font-bold transition-all px-8 py-3.5 rounded-xl text-sm shadow-lg shadow-blue-600/30 disabled:opacity-60 cursor-pointer"
              >
                {loading ? 'Processing Application...' : 'Pay ₹1,000 Registration Fee & Submit'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}