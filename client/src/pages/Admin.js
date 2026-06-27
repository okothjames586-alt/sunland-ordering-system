import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { adminAPI } from '../services/api';
import { useAuthStore } from '../context/authStore';
import './Admin.css';

export default function Admin() {
  const { token, user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [total, setTotal] = useState(0);
  const [driverDetails, setDriverDetails] = useState({});
  const [activeTab, setActiveTab] = useState('pending');

  useEffect(() => {
    if (!user || user.role !== 'admin') return;
    setOrders([]);
    setPage(1);
    if (activeTab === 'customers') {
      fetchCustomers();
    } else {
      const status = activeTab === 'approved' ? 'confirmed' : activeTab === 'delivered' ? 'delivered' : 'pending';
      fetchOrders(status, 1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, activeTab]);

  const fetchOrders = async (status = 'pending', pageToLoad = 1) => {
    setLoading(true);
    try {
      const res = await adminAPI.listOrders({ status, page: pageToLoad, limit });
      const payload = res.data || {};
      const received = payload.orders || [];
      const receivedTotal = payload.total || 0;

      const initialDriverDetails = {};
      received.forEach((order) => {
        initialDriverDetails[order._id || order.id] = {
          name: order.rider?.name || order.driver?.name || '',
          phone: order.rider?.phone || order.driver?.phone || '',
        };
      });

      if (pageToLoad === 1) {
        setOrders(received);
      } else {
        setOrders((prev) => [...prev, ...received]);
      }
      setDriverDetails((prev) => ({ ...prev, ...initialDriverDetails }));
      setTotal(receivedTotal);
      setPage(pageToLoad);
    } catch (err) {
      console.error('Failed to fetch orders', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCustomers = async () => {
    try {
      const res = await adminAPI.listUsers();
      setCustomers(res.data.users || []);
    } catch (err) {
      console.error('Failed to fetch customers', err);
    }
  };

  const refreshOrders = async () => {
    const status = activeTab === 'approved' ? 'confirmed' : activeTab === 'delivered' ? 'delivered' : 'pending';
    await fetchOrders(status, 1);
  };

  const handleApprove = async (id) => {
    try {
      await adminAPI.approveOrder(id);
      await refreshOrders();
    } catch (err) {
      console.error('Failed to approve order', err.response?.data || err.message || err);
    }
  };

  const handleCancel = async (id) => {
    try {
      await adminAPI.declineOrder(id);
      await refreshOrders();
    } catch (err) {
      console.error('Failed to cancel order', err.response?.data || err.message || err);
    }
  };

  const handleMarkDelivered = async (id) => {
    try {
      await adminAPI.markDelivered(id);
      toast.success('Order marked delivered');
      await refreshOrders();
    } catch (err) {
      console.error('Failed to mark delivered', err);
      const status = err.response?.status;
      const detail = err.response?.data?.error || JSON.stringify(err.response?.data) || err.message || 'Failed to mark order delivered';
      toast.error(`${status ? `${status}: ` : ''}${detail}`);
    }
  };

  const handleDeleteOrder = async (id) => {
    if (!window.confirm('Delete this order permanently?')) return;
    try {
      await adminAPI.deleteOrder(id);
      setOrders((prev) => prev.filter((order) => order._id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const handleAssignDriver = async (id) => {
    try {
      const details = driverDetails[id] || {};
      if (!details.name && !details.phone) {
        window.alert('Enter rider name or phone before saving.');
        return;
      }
      await adminAPI.assignDriver(id, {
        name: details.name,
        phone: details.phone,
      });
      fetchOrders(activeTab === 'approved' ? 'confirmed' : activeTab === 'delivered' ? 'delivered' : 'pending', 1);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCustomerDelete = async (id) => {
    if (!window.confirm('Delete this customer profile permanently?')) return;
    try {
      await adminAPI.deleteUser(id);
      setCustomers((prev) => prev.filter((customer) => customer._id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const handleDriverInput = (orderId, field, value) => {
    setDriverDetails((prev) => ({
      ...prev,
      [orderId]: {
        ...prev[orderId],
        [field]: value,
      },
    }));
  };

  if (!token) {
    return <div className="admin-guard-card">Please log in as admin to view this page.</div>;
  }

  if (!user) {
    return <div className="admin-guard-card">Loading admin dashboard...</div>;
  }

  if (user.role !== 'admin') {
    return (
      <div className="admin-guard-card">
        <div className="admin-guard-badge">Restricted</div>
        <h2>Admin access required</h2>
        <p>You are signed in, but your account does not have admin privileges.</p>
        <p>Please log out and sign in with an admin account, or register a new admin account.</p>
        <div className="admin-guard-actions">
          <button
            type="button"
            onClick={() => {
              logout();
              navigate('/register?role=admin');
            }}
            className="approve-btn"
          >
            Logout & Register Admin
          </button>
          <button
            type="button"
            onClick={() => {
              logout();
              navigate('/login');
            }}
            className="decline-btn"
          >
            Logout & Login
          </button>
        </div>
      </div>
    );
  }

  const isPendingTab = activeTab === 'pending';
  const isApprovedTab = activeTab === 'approved';
  const isDeliveredTab = activeTab === 'delivered';
  const isCustomersTab = activeTab === 'customers';
  const currentStatusLabel = isApprovedTab ? 'approved' : isDeliveredTab ? 'delivered' : 'pending';
  const summaryCards = [
    {
      label: isCustomersTab ? 'Customer profiles' : 'Visible orders',
      value: isCustomersTab ? customers.length : orders.length,
      tone: 'accent',
    },
    {
      label: 'Current view',
      value: isCustomersTab ? 'Customers' : currentStatusLabel.replace(/^./, (char) => char.toUpperCase()),
      tone: 'soft',
    },
    {
      label: 'Registered users',
      value: customers.length,
      tone: 'neutral',
    },
  ];

  return (
    <div className="admin-page">
      <div className="admin-tabs">
        <button
          type="button"
          className={`admin-tab ${isPendingTab ? 'active' : ''}`}
          onClick={() => setActiveTab('pending')}
        >
          Pending Orders
        </button>
        <button
          type="button"
          className={`admin-tab ${isApprovedTab ? 'active' : ''}`}
          onClick={() => setActiveTab('approved')}
        >
          Approved Orders
        </button>
        <button
          type="button"
          className={`admin-tab ${isDeliveredTab ? 'active' : ''}`}
          onClick={() => setActiveTab('delivered')}
        >
          Delivered Orders
        </button>
        <button
          type="button"
          className={`admin-tab ${isCustomersTab ? 'active' : ''}`}
          onClick={() => setActiveTab('customers')}
        >
          Customers
        </button>
      </div>

      <div className="admin-hero">
        <div className="admin-hero-content">
          <div className="admin-hero-badge">Sunland Admin</div>
          <h2>Operations dashboard</h2>
          <p>
            {isPendingTab && 'Approve or cancel orders, assign riders, and follow up with customers in one place.'}
            {isApprovedTab && 'Review confirmed orders and keep rider details up to date for smooth dispatch.'}
            {isDeliveredTab && 'Track completed deliveries and clear out older records quickly.'}
            {isCustomersTab && 'Review active customer profiles and keep contact information organised.'}
          </p>
        </div>
        <div className="admin-hero-stats">
          {summaryCards.map((card) => (
            <div key={card.label} className={`admin-stat-card ${card.tone}`}>
              <span>{card.label}</span>
              <strong>{card.value}</strong>
            </div>
          ))}
        </div>
      </div>

      {!isCustomersTab && (
        <>
          {loading && <div className="admin-loading">Loading {currentStatusLabel} orders...</div>}
          {!loading && orders.length === 0 && <div className="admin-empty">No {currentStatusLabel} orders found.</div>}

          <ul className="admin-order-list">
        {orders.map((o) => {
          const customer = o.customer || o.user || {};
          const phone = customer.phone || '';
          const email = customer.email || 'N/A';
          const address = o.deliveryAddress;
          const orderItems = Array.isArray(o.items)
            ? o.items.map((item) => `${item.quantity}× ${item.menu?.name || item.menu || 'Unknown'}`).join(', ')
            : 'No items';
          const rider = o.rider || {};
          const assignedDriver = o.driver || {};
          const detailKey = o._id || o.id;
          const formValues = driverDetails[detailKey] || { name: rider.name || assignedDriver.name || '', phone: rider.phone || assignedDriver.phone || '' };

          return (
            <li key={detailKey} className="admin-order-card">
              <div className="admin-order-card-header">
                <div>
                  <p className="order-card-label">Order #{o.orderNumber || detailKey}</p>
                  <h3>{customer.name || 'Guest customer'}</h3>
                </div>
                <span className={`order-chip ${o.status || 'pending'}`}>{(o.status || 'pending').toUpperCase()}</span>
              </div>

              <div className="admin-order-grid">
                <div className="admin-order-row">
                  <div><strong>Customer:</strong> {customer.name || 'Unknown'}</div>
                  <div><strong>Phone:</strong> {phone || 'N/A'}</div>
                </div>
                <div className="admin-order-row">
                  <div><strong>Email:</strong> {email}</div>
                  <div><strong>Total:</strong> KES {o.totalAmount?.toFixed(2) || '0.00'}</div>
                </div>
              </div>

              {address && (
                <div className="admin-order-row admin-address-row">
                  <strong>Delivery:</strong> {address.street || ''}, {address.city || ''} {address.postalCode || ''}
                </div>
              )}

              <div className="admin-order-row admin-items-row">
                <strong>Items:</strong> {orderItems}
              </div>

              {(rider.name || assignedDriver.name) && (
                <div className="admin-order-row admin-items-row">
                  <strong>Rider:</strong> {rider.name || assignedDriver.name} {rider.phone || assignedDriver.phone ? `| ${rider.phone || assignedDriver.phone}` : ''}
                </div>
              )}

              <div className="driver-form">
                <label htmlFor={`driver-name-${detailKey}`}>Rider Name</label>
                <input
                  id={`driver-name-${detailKey}`}
                  type="text"
                  placeholder="Enter rider name"
                  value={formValues.name}
                  onChange={(e) => handleDriverInput(detailKey, 'name', e.target.value)}
                />
                <label htmlFor={`driver-phone-${detailKey}`}>Rider Phone</label>
                <input
                  id={`driver-phone-${detailKey}`}
                  type="text"
                  placeholder="Enter rider phone"
                  value={formValues.phone}
                  onChange={(e) => handleDriverInput(detailKey, 'phone', e.target.value)}
                />
                <button type="button" className="assign-btn" onClick={() => handleAssignDriver(detailKey)}>
                  Save Rider Details
                </button>
              </div>

              <div className="admin-actions">
                {isPendingTab && (
                  <>
                    <button onClick={() => handleApprove(detailKey)} className="approve-btn">Approve</button>
                    <button onClick={() => handleCancel(detailKey)} className="decline-btn">Cancel</button>
                  </>
                )}
                {isApprovedTab && (
                  <button onClick={() => handleMarkDelivered(detailKey)} className="approve-btn">
                    Mark Delivered
                  </button>
                )}
                {isDeliveredTab && (
                  <button onClick={() => handleDeleteOrder(detailKey)} className="decline-btn">
                    Delete Order
                  </button>
                )}
                {!isDeliveredTab && !isCustomersTab && (
                  <button onClick={() => handleDeleteOrder(detailKey)} className="delete-btn">
                    Delete Order
                  </button>
                )}
                {phone && (
                  <a href={`tel:${phone.replace(/\s+/g, '')}`} className="call-btn">
                    Call Customer
                  </a>
                )}
              </div>
            </li>
          );
        })}
      </ul>

          {total > orders.length && (
            <div style={{ textAlign: 'center', marginTop: 12 }}>
              <button
                onClick={() => {
                  const status = isApprovedTab ? 'confirmed' : isDeliveredTab ? 'delivered' : 'pending';
                  fetchOrders(status, page + 1);
                }}
                disabled={loading}
                className="load-more-btn"
              >
                {loading ? 'Loading...' : 'Load more'}
              </button>
            </div>
          )}
        </>
      )}

      {isCustomersTab && (
        <div className="customer-section">
          <h3>Customer Profiles</h3>
          {customers.length === 0 ? (
            <div className="admin-empty">No customer profiles found.</div>
          ) : (
            <ul className="customer-list">
              {customers.map((customer) => (
                <li key={customer._id} className="customer-card">
                  <div className="customer-meta">
                    <p><strong>{customer.name}</strong></p>
                    <p>{customer.email}</p>
                    <p>{customer.phone}</p>
                    <p>{customer.address || 'No address provided'}</p>
                    <p>{customer.createdAt ? new Date(customer.createdAt).toLocaleString() : ''}</p>
                  </div>
                  <button type="button" className="delete-user-btn" onClick={() => handleCustomerDelete(customer._id)}>
                    Delete Customer
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
