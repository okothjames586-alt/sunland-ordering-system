import express from 'express';
import * as authController from '../controllers/authController.js';

const router = express.Router();

// Legacy direct auth endpoints (no OTP required for register/login)
// The OTP-based register/login flow is removed for normal authentication.
router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/refresh-token', authController.refreshToken);

// Password reset endpoints still use OTP for security
router.post('/forgot-password-request', authController.forgotPasswordRequest);
router.post('/forgot-password-verify', authController.forgotPasswordVerify);
router.post('/reset-password-confirm', authController.resetPasswordConfirm);

export default router;