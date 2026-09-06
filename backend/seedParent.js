require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./src/models/User');
const bcrypt = require('bcryptjs');

const seedParent = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/school_management');

    const exists = await User.findOne({ email: 'parent@school.com' });
    if (exists) {
      console.log('⚠️ Parent account already exists!');
      process.exit(0);
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('Parent@123', salt);

    await User.create({
      name: 'Mr. Ramesh Sharma (Parent)',
      email: 'parent@school.com',
      password: hashedPassword,
      role: 'PARENT',
      phone: '9876500000',
      isActive: true
    });

    console.log('✅ Parent Account Created Successfully!');
    console.log('--------------------------------------------------');
    console.log('Email   : parent@school.com');
    console.log('Password: Parent@123');
    console.log('Role    : PARENT');
    console.log('--------------------------------------------------');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

seedParent();
