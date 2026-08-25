import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import './ForgotPassword.css';

const ForgotPassword = () => {
  const [identifier, setIdentifier] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleRequestSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await api.post('/auth/forgot-password-request', {
        identifier: identifier.trim()
      });

      sessionStorage.setItem('passwordResetToken', response.data.token);
      sessionStorage.setItem('passwordResetUserId', response.data.userId);

      setSuccess(response.data.message || 'Password reset session started. No OTP required.');
      setTimeout(() => navigate('/reset-password'), 800);
    } catch (error) {
      console.error('Forgot password request failed:', error);

      const serverError = error.response?.data?.error || error.response?.data || null;
      if (serverError) {
        setError(typeof serverError === 'string' ? serverError : JSON.stringify(serverError));
      } else {
        setError('Request failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="forgot-password-container">
      <div className="forgot-password-card">
        <h2>Reset Your Password</h2>
        <p className="subtitle">Enter the email or phone number linked to your account.</p>

        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        <form onSubmit={handleRequestSubmit} className="forgot-password-form">
          <div className="input-group">
            <label htmlFor="identifier">Email or phone number</label>
            <input
              id="identifier"
              type="text"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder="Enter email or phone number"
              required
              autoComplete="username"
            />
          </div>
          <button type="submit" disabled={loading} className="submit-btn">
            {loading ? 'Preparing reset...' : 'Reset'}
          </button>
        </form>

        <p className="back-to-login">
          Remember your password? <Link to="/login">Back to Login</Link>
        </p>
      </div>
    </div>
  );
};

export default ForgotPassword;
