import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { userAPI } from '../services/api';
import { useAuthStore } from '../context/authStore';
import './Profile.css';

const Profile = () => {
  const { user, setUser } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: {
      street: user?.address?.street || '',
      city: user?.address?.city || '',
      postalCode: user?.address?.postalCode || ''
    }
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        address: {
          street: user.address?.street || '',
          city: user.address?.city || '',
          postalCode: user.address?.postalCode || ''
        }
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('address.')) {
      const field = name.split('.')[1];
      setFormData({
        ...formData,
        address: {
          ...formData.address,
          [field]: value
        }
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      // Update profile via API and update local store
      const response = await userAPI.updateProfile(formData);
      const updated = response.data.user || response.data;
      setUser(updated);
      setEditing(false);
      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="profile-page">
      <h1>My Profile</h1>

      <div className="profile-container">
        <div className="profile-header">
          <div className="profile-avatar">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div className="profile-info">
            <h2>{user?.name}</h2>
            <p>{user?.email}</p>
            <p>{user?.phone}</p>
          </div>
          <button
            onClick={() => setEditing(!editing)}
            className="edit-btn"
          >
            {editing ? 'Cancel' : 'Edit Profile'}
          </button>
        </div>

        {editing ? (
          <form onSubmit={handleSubmit} className="profile-form">
            <div className="form-section">
              <h3>Personal Information</h3>
              <div className="input-field">
                <label>Full Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  disabled={loading}
                />
              </div>

              <div className="input-field">
                <label>Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  disabled={loading}
                />
              </div>

              <div className="input-field">
                <label>Phone Number</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <div className="form-section">
              <h3>Address</h3>
              <div className="input-field">
                <label>Street Address</label>
                <input
                  type="text"
                  name="address.street"
                  value={formData.address.street}
                  onChange={handleChange}
                  required
                  disabled={loading}
                />
              </div>

              <div className="input-field">
                <label>City</label>
                <input
                  type="text"
                  name="address.city"
                  value={formData.address.city}
                  onChange={handleChange}
                  required
                  disabled={loading}
                />
              </div>

              <div className="input-field">
                <label>Postal Code</label>
                <input
                  type="text"
                  name="address.postalCode"
                  value={formData.address.postalCode}
                  onChange={handleChange}
                  disabled={loading}
                />
              </div>
            </div>

            <div className="form-actions">
              <button type="submit" disabled={loading}>
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        ) : (
          <div className="profile-details">
            <div className="detail-section">
              <h3>Personal Information</h3>
              <div className="detail-item">
                <span>Name:</span>
                <span>{user?.name}</span>
              </div>
              <div className="detail-item">
                <span>Email:</span>
                <span>{user?.email}</span>
              </div>
              <div className="detail-item">
                <span>Phone:</span>
                <span>{user?.phone}</span>
              </div>
            </div>

            <div className="detail-section">
              <h3>Address</h3>
              <div className="detail-item">
                <span>Street:</span>
                <span>{user?.address?.street}</span>
              </div>
              <div className="detail-item">
                <span>City:</span>
                <span>{user?.address?.city}</span>
              </div>
              <div className="detail-item">
                <span>Postal Code:</span>
                <span>{user?.address?.postalCode}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
