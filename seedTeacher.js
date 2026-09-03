require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./src/models/User');
const bcrypt = require('bcryptjs');

const seedTeacher = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/school_management');

    const exists = await User.findOne({ email: 'teacher@school.com' });
    if (exists) {
      console.log('⚠️ Teacher user already exists');
      process.exit(0);
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('teacher123', salt);

    await User.create({
      name: 'Dr. R. K. Sharma',
      email: 'teacher@school.com',
      password: hashedPassword,
      role: 'TEACHER',
      phone: '9876543210',
      isActive: true
    });

    console.log('✅ Teacher Account Created Successfully!');
    console.log('Email: teacher@school.com | Password: teacher123');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

seedTeacher();
