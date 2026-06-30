import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCartStore } from '../context/cartStore';
import { orderAPI } from '../services/api';
import { toast } from 'react-toastify';
import './Checkout.css';

const Checkout = () => {
  const navigate = useNavigate();
  const cartItems = useCartStore((state) => state.items);
  const clearCart = useCartStore((state) => state.clearCart);
  
  const [address, setAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('mpesa');
  const [paymentPhone, setPaymentPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const total = cartItems.reduce((sum, item) => sum + item.price * (item.quantity || 1), 0);

  const handlePlaceOrder = async () => {
    setError('');
    setSuccess('');

    if (!address.trim()) {
      setError('Please enter a delivery address.');
      return;
    }

    if (paymentMethod !== 'cash_on_delivery' && !paymentPhone.trim()) {
      setError('Please enter the phone number for your mobile money payment.');
      return;
    }

    if (cartItems.length === 0) {
      setError('Your cart is empty. Add items before placing an order.');
      return;
    }

    setLoading(true);

    try {
      const orderPayload = {
        items: cartItems.map((item) => ({
          menuId: item._id,
          name: item.name,
          category: item.category,
          price: item.price,
          description: item.description,
          image: item.image,
          quantity: item.quantity,
          specialInstructions: item.variant ? `Variant: ${item.variant}` : item.specialInstructions || ''
        })),
        deliveryAddress: address,
        paymentMethod,
        paymentPhone: paymentMethod === 'cash_on_delivery' ? undefined : paymentPhone,
        notes
      };

      await orderAPI.createOrder(orderPayload);
      clearCart();
      toast.success('Order placed successfully!');
      setSuccess('Order placed successfully!');
      navigate('/orders');
    } catch (error) {
      if (error.response?.status === 401) {
        setError('Session expired. Please log in again.');
      } else {
        setError(error.response?.data?.error || 'Failed to place order. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="checkout-container">
      <h1>Checkout</h1>
      <div className="checkout-card">
        <div className="checkout-field">
          <label>Delivery Address</label>
          <textarea
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Enter your delivery address"
            rows={3}
          />
        </div>

        <div className="checkout-field">
          <label>Payment Method</label>
          <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
            <option value="mpesa">M-Pesa</option>
            <option value="airtel_money">Airtel Money</option>
            <option value="cash_on_delivery">Cash on Delivery</option>
          </select>
        </div>

        {paymentMethod !== 'cash_on_delivery' && (
          <>
            <div className="checkout-field">
              <label>Phone Number</label>
              <input
                type="tel"
                value={paymentPhone}
                onChange={(e) => setPaymentPhone(e.target.value)}
                placeholder="Enter mobile money phone number"
              />
              <small>The payment provider will send a push notification to this number.</small>
            </div>
          </>
        )}

        {paymentMethod === 'mpesa' && (
          <div className="checkout-field mpesa-till-info">
            <label>M-Pesa Till Number</label>
            <div style={{ 
              background: '#f0f4f8', 
              padding: '12px 16px', 
              borderRadius: '8px', 
              marginBottom: '8px',
              border: '2px solid #2f855a'
            }}>
              <p style={{ margin: '0 0 8px 0', color: '#333', fontSize: '14px' }}>
                Please send your M-Pesa payment to the Till Number below:
              </p>
              <p style={{ 
                margin: '0', 
                fontSize: '24px', 
                fontWeight: 'bold', 
                color: '#2f855a',
                textAlign: 'center',
                fontFamily: 'monospace'
              }}>
                9986957
              </p>
              <p style={{ margin: '8px 0 0 0', color: '#666', fontSize: '12px' }}>
                Enter the amount: <strong>KES {total}</strong>
              </p>
            </div>
          </div>
        )}

        <div className="checkout-field">
          <label>Order Notes</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Additional delivery or order notes (optional)"
            rows={2}
          />
        </div>

        <div className="order-summary">
          <h2>Order Summary</h2>
          <p>Items: {cartItems.length}</p>
          <p>Total: Ksh {total}</p>
          <p>
            Payment: {paymentMethod === 'mpesa' ? 'M-Pesa' : paymentMethod === 'airtel_money' ? 'Airtel Money' : 'Cash on Delivery'}
          </p>
        </div>

        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        <button
          onClick={handlePlaceOrder}
          disabled={
            loading ||
            !address.trim() ||
            (paymentMethod !== 'cash_on_delivery' && !paymentPhone.trim())
          }
          className="checkout-button"
        >
          {loading ? 'Placing order...' : 'Place Order'}
        </button>
      </div>
    </div>
  );
};

export default Checkout;
