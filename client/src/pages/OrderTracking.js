import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { orderAPI } from '../services/api';
import { initializeSocket, joinOrderTracking, onLocationUpdate, onOrderStatusUpdate, leaveOrderTracking } from '../services/socket';
import MapComponent from '../components/MapComponent';
import './OrderTracking.css';

const OrderTracking = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [driverLocation, setDriverLocation] = useState(null);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const response = await orderAPI.getById(orderId);
        setOrder(response.data);
      } catch (error) {
        toast.error('Failed to load order details');
        navigate('/orders');
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId, navigate]);

  useEffect(() => {
    if (!order) return;

    const socket = initializeSocket();
    joinOrderTracking(orderId);

    onLocationUpdate(orderId, (locationData) => {
      setDriverLocation(locationData);
    });

    onOrderStatusUpdate(orderId, (update) => {
      setOrder((currentOrder) => ({
        ...currentOrder,
        status: update.status,
        rider: update.rider || currentOrder.rider,
        driver: update.driver || currentOrder.driver
      }));
    });

    return () => {
      leaveOrderTracking(orderId);
    };
  }, [orderId, order]);

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

  if (loading) {
    return <div className="loading">Loading order details...</div>;
  }

  if (!order) {
    return <div className="error">Order not found</div>;
  }

  return (
    <div className="order-tracking-page">
      <div className="tracking-header">
        <h1>Order #{order.orderNumber}</h1>
        <div className="order-status" style={{ backgroundColor: getStatusColor(order.status) }}>
          {getStatusText(order.status)}
        </div>
      </div>

      <div className="tracking-content">
        <div className="order-details">
          <div className="detail-section">
            <h3>Order Items</h3>
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
            <div className="order-total">
              <strong>Total: KES {order.totalAmount.toLocaleString()}</strong>
            </div>
          </div>

          <div className="detail-section">
            <h3>Delivery Address</h3>
            <p>{order.deliveryAddress.street}</p>
            <p>{order.deliveryAddress.city}</p>
          </div>

          <div className="detail-section">
            <h3>Payment Method</h3>
            <p>{order.paymentMethod.replace('_', ' ').toUpperCase()}</p>
          </div>

          {/* Rider info shown in the map section card; removed duplicate here */}
        </div>

        <div className="map-section">
          <h3>Live Tracking</h3>
          {driverLocation ? (
            <MapComponent
              driverLocation={driverLocation}
              deliveryAddress={order.deliveryAddress}
            />
          ) : order.status === 'delivered' ? (
            <div className="map-placeholder">
              <p>Your order has been delivered. Enjoy your meal!</p>
            </div>
          ) : order.status !== 'pending' && order.status !== 'cancelled' ? (
            <div className="rider-card">
              <div className="rider-avatar">🚴</div>
              <div className="rider-info">
                <div className="rider-status">Rider Assigned</div>
                <div className="rider-name">{order.rider?.name || order.driver?.name || 'Not assigned yet'}</div>
                <div className="rider-phone">{order.rider?.phone || order.driver?.phone || 'No phone available'}</div>
                <div className="rider-message">Your order has been approved for delivery. Live tracking will begin when the rider shares their location.</div>
              </div>
              <div className="rider-actions">
                {(order.rider?.phone || order.driver?.phone) ? (
                  <a className="btn-primary" href={`tel:${(order.rider?.phone || order.driver?.phone).replace(/\s+/g, '')}`}>Call Rider</a>
                ) : (
                  <button className="btn-secondary" disabled>Call Rider</button>
                )}
              </div>
            </div>
          ) : (
            <div className="map-placeholder">
              <p>Map will be available once your order is approved for delivery.</p>
            </div>
          )}
        </div>
      </div>

      <div className="tracking-actions">
        <button onClick={() => navigate('/orders')} className="btn-secondary">
          Back to Orders
        </button>
        {order.status === 'delivered' && (
          <button className="btn-primary">
            Rate Order
          </button>
        )}
      </div>
    </div>
  );
};

export default OrderTracking;
