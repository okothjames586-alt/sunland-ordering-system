import dotenv from 'dotenv';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import User from '../models/User.js';

dotenv.config();

const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/sunland-ordering';

async function run() {
  try {
    await mongoose.connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('Connected to MongoDB');

    const email = process.env.TEST_ADMIN_EMAIL || 'admin@sunland.com';
    const phone = process.env.TEST_ADMIN_PHONE || '0712345678';
    const password = process.env.TEST_ADMIN_PASSWORD || 'SunlandAdmin2026!';
    const name = process.env.TEST_ADMIN_NAME || 'Sunland Admin';

    let user = await User.findOne({ email });
    if (user) {
      console.log('Admin user already exists:', user.email);
    } else {
      const hashed = await bcrypt.hash(password, 10);
      user = new User({ name, email, phone, password: hashed, role: 'admin', isEmailVerified: true, isPhoneVerified: true });
      console.log('Created admin user:', email);
    }

    // Ensure the admin user has a valid sessionId for auth middleware.
    const sessionId = typeof crypto.randomUUID === 'function'
      ? crypto.randomUUID()
      : crypto.randomBytes(16).toString('hex');
    user.currentSessionId = sessionId;
    await user.save();

    const token = jwt.sign(
      { userId: user._id, role: user.role, email: user.email, sessionId },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    console.log('Admin credentials:');
    console.log('  email:', email);
    console.log('  password:', process.env.TEST_ADMIN_PASSWORD ? '(from env)' : password);
    console.log('  token:', token);

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('Error creating admin user:', err);
    process.exit(1);
  }
}

run();
