import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../context/authStore';
import api from '../services/api';
import './Login.css';

const Login = () => {
  // Login form states (email or phone-based)
  const [loginInput, setLoginInput] = useState('');
  const [inputType, setInputType] = useState('phone'); // 'phone' or 'email'
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuthStore();
  const navigate = useNavigate();

  // Auto-detect if input is email or phone
  const detectInputType = (input) => {
    const trimmedInput = input.trim();
    if (trimmedInput.includes('@')) {
      setInputType('email');
    } else {
      setInputType('phone');
    }
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const trimmedLoginInput = loginInput.trim();
      const loginPayload = {
        password,
        ...(inputType === 'email'
          ? { email: trimmedLoginInput }
          : { phone: trimmedLoginInput.replace(/[^\d+]/g, '') })
      };

      const response = await api.post('/auth/login', loginPayload);
      login(response.data.token, response.data.user);
      navigate('/');
    } catch (error) {
      console.error('Login request failed:', error);

      const serverError = error.response?.data?.error || error.response?.data || null;
      if (serverError) {
        setError(typeof serverError === 'string' ? serverError : JSON.stringify(serverError));
      } else if (error.response?.status === 401) {
        setError('Invalid email/phone or password.');
      } else {
        setError('Login failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="login-container">
      <div className="login-card">
        <h1>Welcome Back</h1>
        <p className="login-subtitle">Sign in to your Sunland Bites account</p>
        
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleLoginSubmit}>
          <div className="form-group">
            <label htmlFor="loginInput">Email or Phone Number</label>
            <input
              id="loginInput"
              type="text"
              placeholder="Enter your email or phone number"
              value={loginInput}
              onChange={(e) => {
                setLoginInput(e.target.value);
                detectInputType(e.target.value);
              }}
              required
            />
            <small style={{ color: '#666', marginTop: '4px', display: 'block' }}>
              {inputType === 'email' ? '📧 Email detected' : '📱 Phone detected'}
            </small>
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <div style={{ position: 'relative' }}>
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
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
          
          <button type="submit" disabled={loading} className="login-btn">
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
        
        <div className="login-footer">
          <p>Don't have an account? <Link to="/register">Register here</Link></p>
          <p>Forgot password? <Link to="/forgot-password">Reset it here</Link></p>
        </div>
      </div>
    </div>
  );
};

export default Login;