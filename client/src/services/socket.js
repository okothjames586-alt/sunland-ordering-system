import io from 'socket.io-client';

const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'https://sunland-ordering-system.onrender.com';

if (!SOCKET_URL) {
  throw new Error('REACT_APP_SOCKET_URL is not set and socket URL cannot be determined.');
}

let socket = null;

export const initializeSocket = () => {
  if (!socket) {
    socket = io(SOCKET_URL);
  }
  return socket;
};

export const joinOrderTracking = (orderId) => {
  if (!socket) socket = initializeSocket();
  socket.emit('join_order', orderId);
};

// orderId included for future scoping, current implementation listens for 'location_updated'
export const onLocationUpdate = (orderId, callback) => {
  if (!socket) socket = initializeSocket();
  socket.on('location_updated', (data) => {
    // ensure the update is for this order
    if (!data || !data.orderId || String(data.orderId) !== String(orderId)) return;
    callback(data);
  });
};

/**
 * Listen for M-Pesa payment confirmation
 */
export const onPaymentConfirmed = (orderId, callback) => {
  if (!socket) socket = initializeSocket();
  socket.on('payment_confirmed', (data) => {
    // Verify the update is for this order
    if (!data || !data.orderId || String(data.orderId) !== String(orderId)) return;
    callback(data);
  });
};

/**
 * Listen for M-Pesa payment failure
 */
export const onPaymentFailed = (orderId, callback) => {
  if (!socket) socket = initializeSocket();
  socket.on('payment_failed', (data) => {
    // Verify the update is for this order
    if (!data || !data.orderId || String(data.orderId) !== String(orderId)) return;
    callback(data);
  });
};

export const onOrderStatusUpdate = (orderId, callback) => {
  if (!socket) socket = initializeSocket();
  socket.on('order_status_updated', (data) => {
    if (!data || !data.orderId || String(data.orderId) !== String(orderId)) return;
    callback(data);
  });
};

export const leaveOrderTracking = (orderId) => {
  if (!socket) return;
  socket.emit('leave_order', orderId);
  socket.off('location_updated');
  socket.off('order_status_updated');
};

export default () => initializeSocket();