import React from 'react';

const CheckoutStatusCard = ({ paymentStatus, paymentMethod, transactionId, otpVerified }) => {
  const normalizedMethod = paymentMethod === 'mpesa' ? 'M-Pesa' : paymentMethod === 'airtel_money' ? 'Airtel Money' : 'Cash on Delivery';
  const paymentState = paymentStatus || 'pending';
  const otpState = otpVerified ? 'Verified' : 'Not yet';

  return (
    <div style={{
      background: '#f8fbff',
      border: '1px solid #dce9f8',
      borderRadius: '12px',
      padding: '1rem',
      marginBottom: '1rem'
    }}>
      <h3 style={{ marginTop: 0, marginBottom: '0.5rem' }}>Checkout Status</h3>
      <p style={{ margin: '0.25rem 0' }}><strong>Payment Status:</strong> {paymentState}</p>
      <p style={{ margin: '0.25rem 0' }}><strong>Payment Method:</strong> {normalizedMethod}</p>
      <p style={{ margin: '0.25rem 0' }}><strong>Transaction ID:</strong> {transactionId || 'Awaiting confirmation'}</p>
      <p style={{ margin: '0.25rem 0' }}><strong>OTP Verified:</strong> {otpState}</p>
    </div>
  );
};

export default CheckoutStatusCard;
