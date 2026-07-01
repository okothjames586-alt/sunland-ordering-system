import React from 'react';
import { Link } from 'react-router-dom';
import './Home.css';

const Home = () => {
  return (
    <div className="home-page">
      <div className="top-contact-banner">
        <p>For inquiries and order placement, call or SMS <a href="tel:0708206566">0708206566</a> / <a href="tel:0113965548">0113965548</a></p>
      </div>
      <div className="hero-section">
        <div className="hero-content">
          <div className="brand-logo">
            <div className="logo-circle">SWG</div>
            <div className="logo-text">
              <h1 className="brand-name">Sunland<span className="brand-highlight">Bites</span></h1>
              <p className="brand-tagline">Sunland Woodvale Gardens. <span className="highlight">Located Along Kalandin-Kamito Higway, Siaya</span></p>
            </div>
          </div>
          <p className="hero-description">A fast, reliable and convenient food delivery service that connects you to your favorite restaurants and food, located along your doorstep.</p>
          <div className="hero-buttons">
            <Link to="/menu" className="btn-primary">Order Now</Link>
            <Link to="/register" className="btn-secondary">Join Us</Link>
          </div>
        </div>
        <div className="hero-image">
          <div className="food-icons">
            🍔 🍕 🍜 🥗 🥤
          </div>
        </div>
      </div>

      <div className="features-section">
        <h2>Why Choose Sunland Bites?</h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">📍</div>
            <h3>Your Nearest Restaurant</h3>
            <p>Quick and reliable service along your area</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🍽️</div>
            <h3>Great Food</h3>
            <p>Fresh ingredients and authentic flavors</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">😊</div>
            <h3>Happy You</h3>
            <p>Your satisfaction is our priority</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🥬</div>
            <h3>Fresh Ingredients</h3>
            <p>Carefully selected for quality meals</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🚚</div>
            <h3>Fast Service</h3>
            <p>Quick delivery along your area</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">✅</div>
            <h3>Safe & Reliable</h3>
            <p>Your food and safety are our priority</p>
          </div>
        </div>
      </div>

      <div className="cta-section">
        <h2>Ready to Order?</h2>
        <p>Browse our menu and place your order now</p>
        <Link to="/menu" className="btn-primary">View Menu</Link>
      </div>

      <div className="contact-section">
        <h2>Inquiries & Order Placement</h2>
        <p>Call or SMS us at:</p>
        <div className="contact-numbers">
          <a href="tel:0708206566">0708206566</a>
          <span>/</span>
          <a href="tel:0113965548">0113965548</a>
        </div>
        <p className="contact-note">Our team is ready to help you with orders and questions.</p>
      </div>
    </div>
  );
};

export default Home;
