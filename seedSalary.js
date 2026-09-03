// backend/seedSalary.js
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./src/models/User');

const seedSalary = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/school_management');

    const teacher = await User.findOne({ role: 'TEACHER' });
    if (!teacher) {
      console.log('⚠️ Pehle seedTeacher.js run karke teacher banayein!');
      process.exit(0);
    }

    const db = mongoose.connection.db;
    const salaryCollection = db.collection('salaries');

    await salaryCollection.deleteMany({ teacherId: teacher._id });

    const sampleSlips = [
      {
        teacherId: teacher._id,
        teacherName: teacher.name,
        teacherEmail: teacher.email,
        month: 'July 2026',
        baseSalary: 45000,
        allowances: 5000,
        deductions: 1500,
        netSalary: 48500,
        paymentStatus: 'APPROVED',
        paymentDate: new Date('2026-07-31')
      },
      {
        teacherId: teacher._id,
        teacherName: teacher.name,
        teacherEmail: teacher.email,
        month: 'August 2026',
        baseSalary: 45000,
        allowances: 6000,
        deductions: 2000,
        netSalary: 49000,
        paymentStatus: 'APPROVED',
        paymentDate: new Date('2026-08-31')
      }
    ];

    await salaryCollection.insertMany(sampleSlips);

    console.log(`✅ Sample Salary Slips Seeded for: ${teacher.name}`);
    process.exit(0);
  } catch (err) {
    console.error('Error seeding salary:', err);
    process.exit(1);
  }
};

seedSalary();
