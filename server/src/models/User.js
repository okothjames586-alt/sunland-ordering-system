import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  phone: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  address: {
    street: String,
    city: String,
    postalCode: String,
    coordinates: {
      latitude: Number,
      longitude: Number
    }
  },
  role: {
    type: String,
    enum: ['customer', 'driver', 'admin'],
    default: 'customer'
  },
  profilePicture: String,
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  isPhoneVerified: {
    type: Boolean,
    default: false
  },
  registrationOTP: String,
  registrationOTPExpiry: Date,
  loginOTP: String,
  loginOTPExpiry: Date,
  passwordResetOTP: String,
  passwordResetOTPExpiry: Date,
  currentSessionId: String,
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model('User', userSchema);