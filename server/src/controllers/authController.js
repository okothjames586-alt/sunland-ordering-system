import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { sendOTPEmail, sendWelcomeEmail } from '../services/emailService.js';
import { sendSMS } from '../services/smsService.js';
import { generateOTP, generateOTPExpiry, verifyOTP } from '../utils/otpUtils.js';

const getJwtSecret = () => process.env.JWT_SECRET || 'your-secret-key';
const createSessionId = () => crypto.randomUUID();

const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// Register - Step 1: Send OTP to email and phone
export const registerRequest = async (req, res) => {
  try {
    const { name, email, phone, password, address, role = 'customer', adminCode } = req.body;

    // Validate required fields
    if (!name || !email || !phone || !password) {
      return res.status(400).json({ error: 'Please provide name, email, phone, and password' });
    }

    // If registering as admin, require admin access code
    const normalizedRole = role === 'admin' ? 'admin' : 'customer';
    if (normalizedRole === 'admin') {
      const expectedCode = process.env.ADMIN_REGISTRATION_CODE || 'sunland-admin-2026';
      if (!adminCode || adminCode.trim() !== expectedCode) {
        return res.status(403).json({ error: 'Invalid admin registration code' });
      }
    }

    // Normalize email and phone for consistency
    const normalizedEmail = email.trim().toLowerCase();
    const normalizedPhone = phone.replace(/[\s\-\(\)]/g, '');

    // Check if user already exists (case-insensitive email check)
    const escapedEmail = escapeRegex(normalizedEmail);
    const existingUser = await User.findOne({ email: { $regex: `^${escapedEmail}$`, $options: 'i' } });
    if (existingUser) {
      return res.status(409).json({ error: 'Account already exists with this email' });
    }

    // Generate OTP
    const otp = generateOTP();
    const otpExpiry = generateOTPExpiry();

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create temporary user document with OTP
    const user = new User({
      name,
      email: normalizedEmail,
      phone: normalizedPhone,
      password: hashedPassword,
      address,
      registrationOTP: otp,
      registrationOTPExpiry: otpExpiry,
      role: normalizedRole
    });

    await user.save();

    // Send OTP via email
    const emailResult = await sendOTPEmail(email, otp, name);

    // Send OTP via SMS (may be a no-op if Twilio not configured)
    const smsResult = await sendSMS(phone, `Your Sunland Bites OTP is: ${otp}. Valid for 10 minutes.`);

    const resp = {
      message: 'OTP processed (email/sms status included)',
      userId: user._id,
      maskedEmail: email.replace(/(.{2})(.*)(@.*)/, '$1****$3'),
      maskedPhone: phone.slice(-4).padStart(phone.length, '*'),
      emailResult,
      smsResult
    };

    // For local debugging, optionally return the OTP in the response when DEBUG_RETURN_OTP=true
    if (process.env.DEBUG_RETURN_OTP === 'true') {
      resp.debugOTP = otp;
    }

    res.status(200).json(resp);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Register - Step 2: Verify OTP and create account
export const registerVerify = async (req, res) => {
  try {
    const { userId, otp } = req.body;

    if (!userId || !otp) {
      return res.status(400).json({ error: 'Please provide userId and OTP' });
    }

    // Find user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Verify OTP
    const otpVerification = verifyOTP(user.registrationOTP, otp, user.registrationOTPExpiry);
    if (!otpVerification.isValid) {
      return res.status(401).json({ error: otpVerification.message });
    }

    // Update user - mark as verified and clear OTP
    user.isEmailVerified = true;
    user.isPhoneVerified = true;
    user.registrationOTP = undefined;
    user.registrationOTPExpiry = undefined;
    await user.save();

    // Send welcome email
    const welcomeEmailResult = await sendWelcomeEmail(user.email, user.name);

    // Send welcome SMS (best-effort)
    let welcomeSmsResult = { success: false, error: 'Not attempted' };
    try {
      welcomeSmsResult = await sendSMS(user.phone, `Welcome to Sunland Bites, ${user.name}! Your account was created successfully.`);
    } catch (err) {
      console.warn('Welcome SMS failed:', err.message || err);
    }

    // Generate token after successful registration so the new user can be logged in immediately
    const sessionId = createSessionId();
    user.currentSessionId = sessionId;
    await user.save();

    const token = jwt.sign(
      { userId: user._id, role: user.role, email: user.email, sessionId },
      getJwtSecret(),
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Registration successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role
      },
      welcomeEmailResult,
      welcomeSmsResult
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Login - Step 1: Send OTP to email and phone
export const loginRequest = async (req, res) => {
  try {
    const { email, phone, password } = req.body;

    if ((!email && !phone) || !password) {
      return res.status(400).json({ error: 'Please provide phone (or email) and password' });
    }

    // Find user by phone (preferred) or email
    let user = null;
    if (phone) {
      // Normalize phone: remove spaces, dashes, and other common formatting
      const normalizedPhone = phone.replace(/[\s\-\(\)]/g, '');
      user = await User.findOne({ phone: normalizedPhone });
      
      // If not found with normalized phone, try exact match as fallback
      if (!user) {
        user = await User.findOne({ phone });
      }
    } else if (email) {
      // Case-insensitive email lookup
      const normalizedEmail = email.trim().toLowerCase();
      const escapedEmail = escapeRegex(normalizedEmail);
      user = await User.findOne({ email: { $regex: `^${escapedEmail}$`, $options: 'i' } });
    }

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate and save login OTP
    const otp = generateOTP();
    const otpExpiry = generateOTPExpiry();

    user.loginOTP = otp;
    user.loginOTPExpiry = otpExpiry;
    await user.save();

    // Send OTP via email (if user has email)
    let emailResult = { success: false, error: 'no-email' };
    if (user.email) {
      emailResult = await sendOTPEmail(user.email, otp, user.name);
    }

    // Send OTP via SMS (best-effort)
    const smsResult = await sendSMS(user.phone, `Your Sunland Bites login OTP is: ${otp}. Valid for 10 minutes.`);

    const resp = {
      message: 'OTP processed (email/sms status included)',
      userId: user._id,
      maskedEmail: user.email ? user.email.replace(/(.{2})(.*)(@.*)/, '$1****$3') : undefined,
      maskedPhone: user.phone ? user.phone.slice(-4).padStart(user.phone.length, '*') : undefined,
      emailResult,
      smsResult
    };

    if (process.env.DEBUG_RETURN_OTP === 'true') {
      resp.debugOTP = otp;
    }

    res.status(200).json(resp);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Login - Step 2: Verify OTP and generate token
export const loginVerify = async (req, res) => {
  try {
    const { userId, otp } = req.body;

    if (!userId || !otp) {
      return res.status(400).json({ error: 'Please provide userId and OTP' });
    }

    // Find user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Verify OTP
    const otpVerification = verifyOTP(user.loginOTP, otp, user.loginOTPExpiry);
    if (!otpVerification.isValid) {
      return res.status(401).json({ error: otpVerification.message });
    }

    // Clear OTP and start a new session
    user.loginOTP = undefined;
    user.loginOTPExpiry = undefined;
    const sessionId = createSessionId();
    user.currentSessionId = sessionId;
    await user.save();

    // Generate token
    const token = jwt.sign(
      { userId: user._id, role: user.role, email: user.email, sessionId },
      getJwtSecret(),
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Resend OTP
export const resendOTP = async (req, res) => {
  try {
    const { userId, type } = req.body; // type: 'registration', 'login', or 'password-reset'

    if (!userId || !type) {
      return res.status(400).json({ error: 'Please provide userId and type' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const otp = generateOTP();
    const otpExpiry = generateOTPExpiry();

    if (type === 'registration') {
      user.registrationOTP = otp;
      user.registrationOTPExpiry = otpExpiry;
    } else if (type === 'login') {
      user.loginOTP = otp;
      user.loginOTPExpiry = otpExpiry;
    } else if (type === 'password-reset') {
      user.passwordResetOTP = otp;
      user.passwordResetOTPExpiry = otpExpiry;
    } else {
      return res.status(400).json({ error: 'Invalid OTP type' });
    }

    await user.save();

    // Send OTP via email and SMS
    const emailResult = await sendOTPEmail(user.email, otp, user.name);
    const smsResult = await sendSMS(user.phone, `Your Sunland Bites OTP is: ${otp}. Valid for 10 minutes.`);

    const resp = {
      message: 'OTP resent (email/sms status included)',
      maskedEmail: user.email.replace(/(.{2})(.*)(@.*)/, '$1****$3'),
      maskedPhone: user.phone.slice(-4).padStart(user.phone.length, '*'),
      emailResult,
      smsResult
    };

    if (process.env.DEBUG_RETURN_OTP === 'true') {
      resp.debugOTP = otp;
    }

    res.json(resp);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Forgot Password - Step 1: Request password reset OTP
export const forgotPasswordRequest = async (req, res) => {
  try {
    const { phone, email } = req.body;

    if (!phone && !email) {
      return res.status(400).json({ error: 'Please provide phone or email' });
    }

    // Find user by phone or email
    let user = null;
    if (phone) {
      user = await User.findOne({ phone });
    } else {
      user = await User.findOne({ email });
    }

    if (!user) {
      return res.status(404).json({ error: 'User not found with provided credentials' });
    }

    // Generate and save password reset OTP
    const otp = generateOTP();
    const otpExpiry = generateOTPExpiry();

    user.passwordResetOTP = otp;
    user.passwordResetOTPExpiry = otpExpiry;
    await user.save();

    // Send OTP via email
    let emailResult = { success: false, error: 'no-email' };
    if (user.email) {
      emailResult = await sendOTPEmail(user.email, otp, user.name, 'password reset');
    }

    // Send OTP via SMS
    const smsResult = await sendSMS(user.phone, `Your Sunland Bites password reset OTP is: ${otp}. Valid for 10 minutes.`);

    const resp = {
      message: 'OTP processed (email/sms status included)',
      userId: user._id,
      maskedEmail: user.email ? user.email.replace(/(.{2})(.*)(@.*)/, '$1****$3') : undefined,
      maskedPhone: user.phone ? user.phone.slice(-4).padStart(user.phone.length, '*') : undefined,
      emailResult,
      smsResult
    };

    if (process.env.DEBUG_RETURN_OTP === 'true') {
      resp.debugOTP = otp;
    }

    res.status(200).json(resp);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Forgot Password - Step 2: Verify OTP for password reset
export const forgotPasswordVerify = async (req, res) => {
  try {
    const { userId, otp } = req.body;

    if (!userId || !otp) {
      return res.status(400).json({ error: 'Please provide userId and OTP' });
    }

    // Find user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Verify OTP
    const otpVerification = verifyOTP(user.passwordResetOTP, otp, user.passwordResetOTPExpiry);
    if (!otpVerification.isValid) {
      return res.status(401).json({ error: otpVerification.message });
    }

    // Generate temporary token for password reset (valid for 15 minutes)
    const token = jwt.sign(
      { userId: user._id, type: 'password-reset' },
      getJwtSecret(),
      { expiresIn: '15m' }
    );

    res.json({
      message: 'OTP verified successfully',
      token,
      userId: user._id
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Reset Password - Step 3: Confirm new password
export const resetPasswordConfirm = async (req, res) => {
  try {
    const { password } = req.body;
    const authHeader = req.headers.authorization;

    if (!password) {
      return res.status(400).json({ error: 'Please provide new password' });
    }

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Missing or invalid authorization token' });
    }

    const token = authHeader.substring(7);

    // Verify token
    let decoded;
    try {
      decoded = jwt.verify(token, getJwtSecret());
    } catch (err) {
      return res.status(401).json({ error: 'Invalid or expired reset token' });
    }

    if (decoded.type !== 'password-reset') {
      return res.status(401).json({ error: 'Invalid token type' });
    }

    // Find user
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Update password
    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;
    user.passwordResetOTP = undefined;
    user.passwordResetOTPExpiry = undefined;
    await user.save();

    // Send password changed confirmation email
    try {
      await sendOTPEmail(user.email, null, user.name, 'password-changed');
    } catch (err) {
      console.warn('Failed to send password change confirmation email:', err.message);
    }

    res.json({
      message: 'Password reset successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Legacy endpoint for backward compatibility
export const login = async (req, res) => {
  try {
    const { email, phone, password } = req.body;

    if ((!email && !phone) || !password) {
      return res.status(400).json({ error: 'Please provide phone (or email) and password' });
    }

    let user = null;
    if (phone) {
      const normalizedPhone = phone.replace(/[\s\-\(\)]/g, '');
      user = await User.findOne({ phone: normalizedPhone }) || await User.findOne({ phone });
    }

    if (!user && email) {
      const normalizedEmail = email.trim().toLowerCase();
      const escapedEmail = escapeRegex(normalizedEmail);
      user = await User.findOne({ email: { $regex: `^${escapedEmail}$`, $options: 'i' } });
    }

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const sessionId = createSessionId();
    user.currentSessionId = sessionId;
    await user.save();

    const token = jwt.sign(
      { userId: user._id, role: user.role, email: user.email, sessionId },
      getJwtSecret(),
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Legacy endpoint for backward compatibility
export const register = async (req, res) => {
  try {
    const { name, email, phone, password, address, role = 'customer', adminCode } = req.body;

    if (!name || !email || !phone || !password) {
      return res.status(400).json({ error: 'Please provide name, email, phone, and password' });
    }

    const normalizedRole = role === 'admin' ? 'admin' : 'customer';
    if (normalizedRole === 'admin') {
      const expectedCode = process.env.ADMIN_REGISTRATION_CODE || 'sunland-admin-2026';
      if (!adminCode || adminCode.trim() !== expectedCode) {
        return res.status(403).json({ error: 'Invalid admin registration code' });
      }
    }

    const normalizedEmail = email.trim().toLowerCase();
    const normalizedPhone = phone.replace(/[\s\-\(\)]/g, '');

    const escapedEmail = escapeRegex(normalizedEmail);
    const existingUser = await User.findOne({
      $or: [
        { email: { $regex: `^${escapedEmail}$`, $options: 'i' } },
        { phone: normalizedPhone }
      ]
    });

    if (existingUser) {
      return res.status(409).json({ error: 'Account already exists with this email or phone' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      name,
      email: normalizedEmail,
      phone: normalizedPhone,
      password: hashedPassword,
      address,
      role: normalizedRole,
      isEmailVerified: true,
      isPhoneVerified: true
    });

    const sessionId = createSessionId();
    user.currentSessionId = sessionId;
    await user.save();

    const token = jwt.sign(
      { userId: user._id, role: user.role, email: user.email, sessionId },
      getJwtSecret(),
      { expiresIn: '24h' }
    );

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const refreshToken = async (req, res) => {
  try {
    const { token } = req.body;

    const decoded = jwt.verify(token, getJwtSecret());
    const user = await User.findById(decoded.userId);

    if (!user || !decoded.sessionId || user.currentSessionId !== decoded.sessionId) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    const sessionId = decoded.sessionId;

    const newToken = jwt.sign(
      { userId: user._id, role: user.role, email: user.email, sessionId },
      getJwtSecret(),
      { expiresIn: '24h' }
    );

    res.json({ token: newToken });
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};