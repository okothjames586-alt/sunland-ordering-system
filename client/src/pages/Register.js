import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '../context/authStore';
import api from '../services/api';
import './Register.css';

const Register = () => {
  // Registration form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [role, setRole] = useState('customer');
  const [adminCode, setAdminCode] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  
  
  const navigate = useNavigate();
  const { login } = useAuthStore();

  const [searchParams] = useSearchParams();

  useEffect(() => {
    const requestedRole = searchParams.get('role');
    if (requestedRole === 'admin') {
      setRole('admin');
    }
  }, [searchParams]);

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    // Validate passwords match
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      setLoading(false);
      return;
    }

    // Validate password length
    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      setLoading(false);
      return;
    }

    // Validate phone number
    if (!phone || phone.length < 10) {
      setError('Please enter a valid phone number.');
      setLoading(false);
      return;
    }

    if (role === 'admin' && !adminCode.trim()) {
      setError('Admin registration requires the admin access code.');
      setLoading(false);
      return;
    }

    try {
      const payload = {
        name,
        email,
        phone,
        password,
        role
      };

      if (role === 'admin') {
        payload.adminCode = adminCode.trim();
      }

      const response = await api.post('/auth/register', payload);
      login(response.data.token, response.data.user);
      setSuccess('Registration successful! Redirecting...');
      setTimeout(() => navigate('/'), 1000);
    } catch (error) {
      console.error('Registration failed:', error);

      const serverError = error.response?.data?.error || error.response?.data || null;
      if (serverError) {
        setError(typeof serverError === 'string' ? serverError : JSON.stringify(serverError));
      } else if (error.response?.status === 409) {
        setError('Account already exists with this email. Please login or use a different email.');
      } else if (error.response?.status === 400) {
        setError('Please fill in all required fields.');
      } else {
        setError(error.message || 'Registration failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="register-container">
      <div className="register-card">
        <h1>{role === 'admin' ? 'Create Admin Account' : 'Create Account'}</h1>
        <p className="register-subtitle">
          {role === 'admin'
            ? 'Register as an admin for Sunland Bites'
            : 'Join Sunland Bites for delicious food delivery'}
        </p>
        
        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}
        
        <form onSubmit={handleRegisterSubmit}>
          <div className="form-group">
            <label htmlFor="name">Full Name</label>
            <input
              id="name"
              type="text"
              placeholder="Enter your full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="phone">Phone Number</label>
            <input
              id="phone"
              type="tel"
              placeholder="Enter your phone number"
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <div style={{ position: 'relative' }}>
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Create a password (min 6 characters)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '10px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '18px'
                }}
              >
                {showPassword ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
          </div>
          
          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <div style={{ position: 'relative' }}>
              <input
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="Confirm your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                style={{
                  position: 'absolute',
                  right: '10px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '18px'
                }}
              >
                {showConfirmPassword ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
          </div>
          
          {role === 'admin' && (
            <div className="form-group">
              <label htmlFor="adminCode">Admin Access Code</label>
              <input
                id="adminCode"
                type="password"
                placeholder="Enter admin access code"
                value={adminCode}
                onChange={(e) => setAdminCode(e.target.value)}
                required={role === 'admin'}
              />
            </div>
          )}

          <button type="submit" disabled={loading} className="register-btn">
            {loading ? 'Creating Account...' : role === 'admin' ? 'Register Admin' : 'Register'}
          </button>
        </form>
        
        <div className="register-footer">
          <p>Already have an account? <Link to="/login">Sign in here</Link></p>
        </div>
      </div>
    </div>
  );
};

export default Register;