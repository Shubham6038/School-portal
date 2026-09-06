require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./src/models/User');
const Fee = require('./src/models/Fee');

const seedFee = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/school_management');

    const student = await User.findOne({ role: 'STUDENT' });

    if (!student) {
      console.log('⚠️ Pehle kisi Student application ko Admin Dashboard se Approve kijiye!');
      process.exit();
    }

    await Fee.create({
      student: student._id,
      admissionNumber: 'ADM-2026-0001',
      title: 'Term 1 Tuition Fee',
      amount: 2500,
      dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
      status: 'PENDING'
    });

    console.log(`✅ Sample Fee Assigned to Student: ${student.name}`);
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

seedFee();
