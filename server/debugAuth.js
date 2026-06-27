import mongoose from 'mongoose';
import User from './src/models/User.js';
import bcrypt from 'bcryptjs';

const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/sunland-ordering';

async function debugUser() {
  try {
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    // Find the user
    const email = 'caleb@gmail.com';
    const user = await User.findOne({ email: { $regex: `^${email}$`, $options: 'i' } });

    if (!user) {
      console.log('User not found');
      await mongoose.disconnect();
      return;
    }

    console.log('\n=== USER DATA ===');
    console.log('ID:', user._id);
    console.log('Name:', user.name);
    console.log('Email (stored):', user.email);
    console.log('Phone (stored):', user.phone);
    console.log('Password Hash:', user.password);
    console.log('Email Verified:', user.isEmailVerified);
    console.log('Phone Verified:', user.isPhoneVerified);
    console.log('Role:', user.role);

    // Test password
    console.log('\n=== PASSWORD TEST ===');
    const testPassword = 'caleb@gmail.com'; // Try their email as password
    console.log('Testing password: caleb@gmail.com');
    let isValid = await bcrypt.compare(testPassword, user.password);
    console.log('Match:', isValid);

    // Close connection
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

debugUser();
