import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { orderAPI } from '../services/api';
import { useAuthStore } from '../context/authStore';
import './Orders.css';

const Orders = () => {
  const { token } = useAuthStore();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }

    const fetchOrders = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await orderAPI.getOrders();
        console.log('Orders API response:', response);
        console.log('Orders data:', response.data);
        const ordersList = Array.isArray(response.data) ? response.data : response.data.orders || [];
        console.log('Orders to display:', ordersList);
        setOrders(ordersList);
      } catch (error) {
        console.error('Failed to load orders:', error);
        console.error('Error details:', error.response?.data || error.message);
        setError('Unable to load your orders right now. Please refresh or try again later.');
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [token]);

  const getStatusColor = (status) => {
    const colors = {
      pending: '#ffa726',
      confirmed: '#42a5f5',
      preparing: '#ab47bc',
      ready: '#66bb6a',
      out_for_delivery: '#26a69a',
      delivered: '#2e7d32',
      cancelled: '#ef5350'
    };
    return colors[status] || '#666';
  };

  const getStatusText = (status) => {
    const texts = {
      pending: 'Order Placed',
      confirmed: 'Approved for Delivery',
      preparing: 'Preparing Food',
      ready: 'Ready for Delivery',
      out_for_delivery: 'Out for Delivery',
      delivered: 'Delivered',
      cancelled: 'Cancelled'
    };
    return texts[status] || status;
  };

  const handleCancelOrder = async (orderId) => {
    if (window.confirm('Are you sure you want to cancel this order?')) {
      try {
        await orderAPI.cancel(orderId);
        toast.success('Order cancelled successfully');
        // Refresh orders
        const response = await orderAPI.getOrders();
        setOrders(Array.isArray(response.data) ? response.data : response.data.orders || []);
      } catch (error) {
        console.error('Failed to cancel order:', error);
        toast.error('Failed to cancel order');
      }
    }
  };

  if (loading) {
    return <div className="loading">Loading your orders...</div>;
  }

  return (
    <div className="orders-page">
      <h1>My Orders</h1>

      {error ? (
        <div className="order-error">
          <p>{error}</p>
          <button onClick={() => window.location.reload()} className="btn-secondary">
            Retry
          </button>
        </div>
      ) : orders.length === 0 ? (
        <div className="no-orders">
          <p>You haven't placed any orders yet</p>
          <button onClick={() => window.location.href = '/menu'}>
            Start Ordering
          </button>
        </div>
      ) : (
        <div className="orders-list">
          {orders.map(order => (
            <div key={order._id} className="order-card">
              <div className="order-header">
                <div className="order-info">
                  <h3>Order #{order.orderNumber}</h3>
                  <p className="order-date">
                    {new Date(order.createdAt).toLocaleDateString()} at{' '}
                    {new Date(order.createdAt).toLocaleTimeString()}
                  </p>
                </div>
                <div className="order-status" style={{ backgroundColor: getStatusColor(order.status) }}>
                  {getStatusText(order.status)}
                </div>
              </div>

              <div className="order-items">
                {order.items.map((item, index) => {
                const itemName = item.name || item.menu?.name || item.menu || 'Unknown Item';
                const itemQuantity = item.quantity || 1;
                const itemTotal = (item.price || 0) * itemQuantity;
                return (
                  <div key={index} className="order-item">
                    <span>{itemName} x {itemQuantity}</span>
                    <span>KES {itemTotal.toLocaleString()}</span>
                  </div>
                );
              })}
              </div>

              <div className="order-footer">
                <div className="order-total">
                  <strong>Total: KES {order.totalAmount.toLocaleString()}</strong>
                </div>
                <div className="order-actions">
                  <button
                    onClick={() => window.location.href = `/order/${order._id}`}
                    className="btn-secondary"
                  >
                    Track Order
                  </button>
                  {order.status === 'pending' && (
                    <button
                      onClick={() => handleCancelOrder(order._id)}
                      className="btn-danger"
                    >
                      Cancel Order
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Orders;
