require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./src/models/User');
const bcrypt = require('bcryptjs');

const seedAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/school_management');

    const exists = await User.findOne({ email: 'principal@school.com' });
    if (exists) {
      console.log('⚠️ Principal / Branch Admin already exists!');
      process.exit(0);
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('admin123', salt);

    await User.create({
      name: 'Principal Sharma (Branch Admin)',
      email: 'principal@school.com',
      password: hashedPassword,
      role: 'SCHOOL_ADMIN',
      phone: '9811223344',
      isActive: true
    });

    console.log('✅ Branch Admin / Principal Account Created Successfully!');
    console.log('--------------------------------------------------');
    console.log('Email   : principal@school.com');
    console.log('Password: admin123');
    console.log('Role    : SCHOOL_ADMIN (Branch Operations & Marks Approver)');
    console.log('--------------------------------------------------');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

seedAdmin();
