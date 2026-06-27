import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './context/authStore';
import { userAPI } from './services/api';
import Navigation from './components/Navigation';
import Home from './pages/Home';
import Menu from './pages/Menu';
import Cart from './pages/Cart';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Checkout from './pages/Checkout';
import Orders from './pages/Orders';
import OrderTracking from './pages/OrderTracking';
import Profile from './pages/Profile';
import Admin from './pages/Admin';
import './App.css';

function App() {
  const { token } = useAuthStore();

  // If a token exists on app load, fetch the current user's profile
  useEffect(() => {
    const fetchProfile = async () => {
      if (!token) return;
      try {
        const { data } = await userAPI.getProfile();
        // support either { user } or direct user object
        const profile = data.user || data;
        useAuthStore.getState().setUser(profile);
      } catch (err) {
        console.error('Failed to fetch profile on startup', err);
      }
    };
    fetchProfile();
  }, [token]);

  return (
    <Router>
      <div className="App">
        <Navigation />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/menu" element={<Menu />} />
            <Route path="/cart" element={token ? <Cart /> : <Navigate to="/login" />} />
            <Route path="/checkout" element={token ? <Checkout /> : <Navigate to="/login" />} />
            <Route path="/orders" element={token ? <Orders /> : <Navigate to="/login" />} />
            <Route path="/order/:orderId" element={token ? <OrderTracking /> : <Navigate to="/login" />} />
            <Route path="/profile" element={token ? <Profile /> : <Navigate to="/login" />} />
            <Route path="/admin" element={token ? <Admin /> : <Navigate to="/register?role=admin" />} />
            <Route path="/admin/login" element={!token ? <Login /> : <Navigate to="/admin" />} />
            <Route path="/admin/register" element={!token ? <Register /> : <Navigate to="/admin" />} />
            <Route path="/login" element={!token ? <Login /> : <Navigate to="/" />} />
            <Route path="/register" element={!token ? <Register /> : <Navigate to="/" />} />
            <Route path="/forgot-password" element={!token ? <ForgotPassword /> : <Navigate to="/" />} />
            <Route path="/reset-password" element={!token ? <ResetPassword /> : <Navigate to="/" />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;