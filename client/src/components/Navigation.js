import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../context/authStore';
import { useCartStore } from '../context/cartStore';
import './Navigation.css';

const Navigation = () => {
  const { token, user, logout } = useAuthStore();
  const cartItems = useCartStore((state) => state.items);
  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="navigation">
      <div className="nav-brand">
        <Link to="/">🍴 SunlandBites</Link>
      </div>
      <ul className="nav-links">
        <li><Link to="/"><span className="nav-icon">🏠</span> Home</Link></li>
        <li><Link to="/menu"><span className="nav-icon">🍽️</span> Menu</Link></li>
        {token ? (
          <>
            <li>
              <Link to="/cart" className="cart-link">
                <span className="nav-icon">🛒</span> Cart
                {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
              </Link>
            </li>
            <li><Link to="/orders">Orders</Link></li>
            {user?.role === 'admin' && <li><Link to="/admin">Admin</Link></li>}
            <li><Link to="/profile">Profile</Link></li>
            <li><button onClick={handleLogout} className="logout-btn">Logout</button></li>
          </>
        ) : (
          <>
            <li><Link to="/login">Login</Link></li>
            <li><Link to="/register" className="register-link">Register</Link></li>
          </>
        )}
      </ul>
    </nav>
  );
};

export default Navigation;