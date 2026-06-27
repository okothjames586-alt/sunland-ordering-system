import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import './ForgotPassword.css';

const ForgotPassword = () => {
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [contactType, setContactType] = useState('phone'); // 'phone' or 'email'
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [showOTPVerification, setShowOTPVerification] = useState(false);
  const [otp, setOtp] = useState('');
  const [userId, setUserId] = useState('');
  const [maskedContact, setMaskedContact] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);

  const navigate = useNavigate();

  // Handle OTP resend timer
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  const handleRequestSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const payload = contactType === 'phone' ? { phone } : { email };
      const response = await api.post('/auth/forgot-password-request', payload);

      setUserId(response.data.userId);
      setMaskedContact(
        contactType === 'phone'
          ? response.data.maskedPhone
          : response.data.maskedEmail
      );

      // If debug OTP returned show it
      if (response.data?.debugOTP) {
        setSuccess(`OTP (debug): ${response.data.debugOTP}`);
      } else {
        setSuccess('OTP sent successfully.');
      }

      setShowOTPVerification(true);
      setResendTimer(60);
    } catch (error) {
      console.error('Forgot password request failed:', error);

      const serverError = error.response?.data?.error || error.response?.data || null;
      if (serverError) {
        setError(typeof serverError === 'string' ? serverError : JSON.stringify(serverError));
      } else if (error.response?.status === 404) {
        setError(`No account found with this ${contactType}.`);
      } else {
        setError('Request failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setError('');
    setOtpLoading(true);

    try {
      const response = await api.post('/auth/resend-otp', {
        userId,
        type: 'password-reset'
      });

      if (response.data?.debugOTP) {
        setSuccess(`OTP (debug): ${response.data.debugOTP}`);
      } else {
        setSuccess('OTP resent successfully.');
      }

      setResendTimer(60);
    } catch (error) {
      console.error('Resend OTP failed:', error);
      setError('Failed to resend OTP. Please try again.');
    } finally {
      setOtpLoading(false);
    }
  };

  const handleOTPVerify = async (e) => {
    e.preventDefault();
    setError('');
    setOtpLoading(true);

    if (!otp || otp.length !== 6) {
      setError('Please enter a valid 6-digit OTP.');
      setOtpLoading(false);
      return;
    }

    try {
      const response = await api.post('/auth/forgot-password-verify', {
        userId,
        otp
      });

      // Store token for password reset page
      sessionStorage.setItem('passwordResetToken', response.data.token);
      sessionStorage.setItem('passwordResetUserId', userId);

      navigate('/reset-password');
    } catch (error) {
      console.error('OTP verification failed:', error);

      if (error.response?.status === 401) {
        setError(error.response.data?.error || 'Invalid or expired OTP.');
      } else if (error.response?.data?.error) {
        setError(error.response.data.error);
      } else {
        setError('OTP verification failed. Please try again.');
      }
    } finally {
      setOtpLoading(false);
    }
  };

  return (
    <div className="forgot-password-container">
      <div className="forgot-password-card">
        {!showOTPVerification ? (
          <>
            <h2>Reset Your Password</h2>
            <p className="subtitle">Enter your phone or email to receive a password reset code</p>

            {error && <div className="error-message">{error}</div>}
            {success && <div className="success-message">{success}</div>}

            <form onSubmit={handleRequestSubmit} className="forgot-password-form">
              <div className="contact-type-selector">
                <label className={`radio-label ${contactType === 'phone' ? 'selected' : ''}`}>
                  <input
                    type="radio"
                    value="phone"
                    checked={contactType === 'phone'}
                    onChange={(e) => {
                      setContactType(e.target.value);
                      setError('');
                    }}
                  />
                  Phone Number
                </label>
                <label className={`radio-label ${contactType === 'email' ? 'selected' : ''}`}>
                  <input
                    type="radio"
                    value="email"
                    checked={contactType === 'email'}
                    onChange={(e) => {
                      setContactType(e.target.value);
                      setError('');
                    }}
                  />
                  Email Address
                </label>
              </div>

              {contactType === 'phone' ? (
                <input
                  type="tel"
                  placeholder="Enter your phone number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                  className="input-field"
                />
              ) : (
                <input
                  type="email"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="input-field"
                />
              )}

              <button type="submit" disabled={loading} className="submit-btn">
                {loading ? 'Sending OTP...' : 'Send Reset Code'}
              </button>
            </form>

            <p className="back-to-login">
              Remember your password? <Link to="/login">Back to Login</Link>
            </p>
          </>
        ) : (
          <>
            <h2>Verify Your Identity</h2>
            <p className="subtitle">
              Enter the 6-digit code we sent to {maskedContact}
            </p>

            {error && <div className="error-message">{error}</div>}
            {success && <div className="success-message">{success}</div>}

            <form onSubmit={handleOTPVerify} className="otp-form">
              <input
                type="text"
                placeholder="000000"
                maxLength="6"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                className="otp-input"
                required
              />

              <button type="submit" disabled={otpLoading} className="submit-btn">
                {otpLoading ? 'Verifying...' : 'Verify Code'}
              </button>
            </form>

            <div className="otp-actions">
              <button
                type="button"
                onClick={handleResendOTP}
                disabled={resendTimer > 0 || otpLoading}
                className="resend-btn"
              >
                {resendTimer > 0 ? `Resend in ${resendTimer}s` : 'Resend Code'}
              </button>
            </div>

            <p className="back-to-login">
              <Link to="/forgot-password" onClick={() => setShowOTPVerification(false)}>
                Back
              </Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
