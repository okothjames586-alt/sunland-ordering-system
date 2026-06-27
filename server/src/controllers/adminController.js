import Order from '../models/Order.js';
import User from '../models/User.js';
import { sendSMS } from '../services/smsService.js';

// List orders with optional status filter (default: pending). Supports pagination via ?page & ?limit
export const listOrders = async (req, res) => {
  try {
    const status = req.query.status || 'pending';
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, parseInt(req.query.limit, 10) || 20);
    const skip = (page - 1) * limit;

    const query = { status };

    const [orders, total] = await Promise.all([
      Order.find(query)
        .populate('customer', 'name phone email')
        .populate('items.menu', 'name price')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Order.countDocuments(query),
    ]);

    res.json({ orders, total, page, limit });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Approve an order: set to 'confirmed'
export const approveOrder = async (req, res) => {
  try {
    const orderId = req.params.id;
    const order = await Order.findByIdAndUpdate(orderId, { status: 'confirmed', updatedAt: Date.now() }, { new: true }).populate('customer');
    if (!order) return res.status(404).json({ error: 'Order not found' });

    // Notify customer
    try { await sendSMS(order.customer.phone, `Your order ${order.orderNumber} has been approved for delivery.`); } catch (e) { console.warn('SMS notify failed', e); }
    req.io?.to(`order_${order._id}`).emit('order_status_updated', {
      orderId: order._id,
      status: order.status,
      orderNumber: order.orderNumber,
      customer: {
        name: order.customer.name,
        phone: order.customer.phone,
        email: order.customer.email
      }
    });

    res.json({ message: 'Order approved', order });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Decline an order: set to 'cancelled'
export const declineOrder = async (req, res) => {
  try {
    const orderId = req.params.id;
    const order = await Order.findByIdAndUpdate(orderId, { status: 'cancelled', updatedAt: Date.now() }, { new: true }).populate('customer');
    if (!order) return res.status(404).json({ error: 'Order not found' });

    try { await sendSMS(order.customer.phone, `Your order ${order.orderNumber} has been cancelled.`); } catch (e) { console.warn('SMS notify failed', e); }
    req.io?.to(`order_${order._id}`).emit('order_status_updated', {
      orderId: order._id,
      status: order.status,
      orderNumber: order.orderNumber,
      customer: {
        name: order.customer.name,
        phone: order.customer.phone,
        email: order.customer.email
      }
    });

    res.json({ message: 'Order cancelled', order });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const assignDriver = async (req, res) => {
  try {
    const orderId = req.params.id;
    const { driverId, name, phone, email } = req.body;

    if (!driverId && !name && !phone && !email) {
      return res.status(400).json({ error: 'Driver details are required' });
    }

    const update = { updatedAt: Date.now() };
    if (driverId) update.driver = driverId;
    if (name || phone || email) {
      update.rider = {
        name: name || undefined,
        phone: phone || undefined,
        email: email || undefined,
      };
    }

    const order = await Order.findByIdAndUpdate(orderId, update, { new: true })
      .populate('customer', 'name phone email')
      .populate('driver', 'name phone email');

    if (!order) return res.status(404).json({ error: 'Order not found' });

    req.io?.to(`order_${order._id}`).emit('order_status_updated', {
      orderId: order._id,
      status: order.status,
      orderNumber: order.orderNumber,
      rider: order.rider,
      driver: order.driver ? { name: order.driver.name, phone: order.driver.phone, email: order.driver.email } : undefined
    });

    res.json({ message: 'Rider details saved', order });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const listUsers = async (req, res) => {
  try {
    const users = await User.find({ role: 'customer' }).select('-password').sort({ createdAt: -1 }).lean();
    res.json({ users, total: users.length });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteOrder = async (req, res) => {
  try {
    const orderId = req.params.id;
    const order = await Order.findByIdAndDelete(orderId).populate('customer');
    if (!order) return res.status(404).json({ error: 'Order not found' });

    if (order.customer?.phone) {
      try { await sendSMS(order.customer.phone, `Order ${order.orderNumber} has been deleted by the admin.`); } catch (err) { console.warn('SMS notify failed', err); }
    }

    req.io?.to(`order_${order._id}`).emit('order_deleted', {
      orderId: order._id,
      orderNumber: order.orderNumber,
    });

    res.json({ message: 'Order deleted', orderId: order._id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const markDelivered = async (req, res) => {
  try {
    const orderId = req.params.id;
    const order = await Order.findById(orderId).populate('customer');

    if (!order) return res.status(404).json({ error: 'Order not found' });

    order.status = 'delivered';
    order.actualDeliveryTime = new Date();
    order.updatedAt = new Date();
    await order.save();

    if (order.customer?.phone) {
      try { await sendSMS(order.customer.phone, `Your order ${order.orderNumber} has been delivered!`); } catch (e) { console.warn('SMS notify failed', e); }
    }

    req.io?.to(`order_${order._id}`).emit('order_status_updated', {
      orderId: order._id,
      status: order.status,
      orderNumber: order.orderNumber
    });

    res.json({ message: 'Order marked delivered', order });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await User.findByIdAndDelete(userId);
    if (!user) return res.status(404).json({ error: 'Customer not found' });

    res.json({ message: 'Customer profile deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export default { listOrders, approveOrder, declineOrder, assignDriver, listUsers, deleteOrder, markDelivered, deleteUser };
