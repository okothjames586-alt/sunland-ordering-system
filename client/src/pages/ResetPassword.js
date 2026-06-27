import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import './ResetPassword.css';

const ResetPassword = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);

  const navigate = useNavigate();

  // Check if user has valid reset token
  useEffect(() => {
    const token = sessionStorage.getItem('passwordResetToken');
    if (!token) {
      navigate('/forgot-password');
    }
  }, [navigate]);

  // Calculate password strength
  useEffect(() => {
    if (!password) {
      setPasswordStrength(0);
      return;
    }

    let strength = 0;
    if (password.length >= 8) strength++;
    if (password.length >= 12) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^a-zA-Z0-9]/.test(password)) strength++;

    setPasswordStrength(Math.ceil((strength / 6) * 100));
  }, [password]);

  const getPasswordStrengthText = () => {
    if (passwordStrength === 0) return '';
    if (passwordStrength <= 25) return 'Weak';
    if (passwordStrength <= 50) return 'Fair';
    if (passwordStrength <= 75) return 'Good';
    return 'Strong';
  };

  const getPasswordStrengthColor = () => {
    if (passwordStrength === 0) return '#ccc';
    if (passwordStrength <= 25) return '#e74c3c';
    if (passwordStrength <= 50) return '#f39c12';
    if (passwordStrength <= 75) return '#f1c40f';
    return '#27ae60';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Validate passwords
    if (!password || !confirmPassword) {
      setError('Please enter both passwords.');
      setLoading(false);
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      setLoading(false);
      return;
    }

    try {
      const userId = sessionStorage.getItem('passwordResetUserId');
      const token = sessionStorage.getItem('passwordResetToken');

      const response = await api.post(
        '/auth/reset-password-confirm',
        { password },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      setSuccess('Password reset successfully!');

      // Clear session storage
      sessionStorage.removeItem('passwordResetToken');
      sessionStorage.removeItem('passwordResetUserId');

      // Redirect to login after 2 seconds
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (error) {
      console.error('Password reset failed:', error);

      if (error.response?.status === 401) {
        setError('Your reset session has expired. Please try again.');
        setTimeout(() => navigate('/forgot-password'), 2000);
      } else if (error.response?.data?.error) {
        setError(error.response.data.error);
      } else {
        setError('Password reset failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="reset-password-container">
      <div className="reset-password-card">
        <h2>Create New Password</h2>
        <p className="subtitle">Enter a strong password to secure your account</p>

        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        <form onSubmit={handleSubmit} className="reset-password-form">
          <div className="password-group">
            <label htmlFor="password">New Password</label>
            <div className="password-input-wrapper">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter new password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="password-input"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="toggle-password-btn"
              >
                {showPassword ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>

            {password && (
              <div className="password-strength">
                <div className="strength-bar">
                  <div
                    className="strength-fill"
                    style={{
                      width: `${passwordStrength}%`,
                      backgroundColor: getPasswordStrengthColor()
                    }}
                  ></div>
                </div>
                <span
                  className="strength-text"
                  style={{ color: getPasswordStrengthColor() }}
                >
                  {getPasswordStrengthText()}
                </span>
              </div>
            )}

            <div className="password-requirements">
              <p>Password should contain:</p>
              <ul>
                <li className={password.length >= 8 ? 'met' : ''}>
                  At least 8 characters
                </li>
                <li className={/[a-z]/.test(password) ? 'met' : ''}>
                  Lowercase letters (a-z)
                </li>
                <li className={/[A-Z]/.test(password) ? 'met' : ''}>
                  Uppercase letters (A-Z)
                </li>
                <li className={/[0-9]/.test(password) ? 'met' : ''}>
                  Numbers (0-9)
                </li>
              </ul>
            </div>
          </div>

          <div className="password-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <div className="password-input-wrapper">
              <input
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="Confirm password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="password-input"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="toggle-password-btn"
              >
                {showConfirmPassword ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>

            {confirmPassword && password !== confirmPassword && (
              <p className="password-mismatch">Passwords do not match</p>
            )}
            {confirmPassword && password === confirmPassword && (
              <p className="password-match">Passwords match ✓</p>
            )}
          </div>

          <button type="submit" disabled={loading} className="submit-btn">
            {loading ? 'Resetting Password...' : 'Reset Password'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
