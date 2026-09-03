require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { MongoMemoryServer } = require('mongodb-memory-server');
const User = require('./src/models/User');

const seedAdmin = async () => {
  try {
    console.log('🔌 Connecting to DB...');

    let mongoUri = process.env.MONGO_URI && process.env.MONGO_URI.trim();

    if (!mongoUri) {
      const mongoServer = await MongoMemoryServer.create();
      mongoUri = mongoServer.getUri();
      console.log('Using in-memory MongoDB for seeding');
    }

    await mongoose.connect(mongoUri);

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('admin12345', salt);

    const adminExists = await User.findOne({ email: 'admin@school.com' });

    if (adminExists) {
      adminExists.name = 'Super Admin';
      adminExists.password = hashedPassword;
      adminExists.role = 'SUPER_ADMIN';
      adminExists.phone = '9876543210';
      adminExists.isActive = true;
      await adminExists.save();

      console.log('⚠️ Existing admin account was reset to the correct SUPER_ADMIN role and password.');
    } else {
      await User.create({
        name: 'Super Admin',
        email: 'admin@school.com',
        password: hashedPassword,
        role: 'SUPER_ADMIN',
        phone: '9876543210',
        isActive: true,
      });

      console.log('🎉 Permanent Super Admin Account Successfully Created!');
    }

    console.log('--------------------------------------------------');
    console.log('Email: admin@school.com');
    console.log('Password: admin12345');
    console.log('Role: SUPER_ADMIN');
    console.log('--------------------------------------------------');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error Seeding Admin:', error.message);
    process.exit(1);
  }
};

seedAdmin();
