import mongoose from 'mongoose';
import Order from '../models/Order.js';
import Menu from '../models/Menu.js';
import resolveMenu from '../utils/menuResolver.js';
import Payment from '../models/Payment.js';
import { initiateMpesaPayment, initiateAirtelPayment } from '../services/paymentService.js';
import { sendSMS } from '../services/smsService.js';

const escapeRegex = (string) => string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export const createOrder = async (req, res) => {
  try {
    const { items, deliveryAddress, paymentMethod, paymentPhone, notes } = req.body;
    const userId = req.userId;
    
    // Validate required fields
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Cart is empty. Please add items before placing an order.' });
    }

    if (!deliveryAddress || typeof deliveryAddress !== 'string' || !deliveryAddress.trim()) {
      return res.status(400).json({ error: 'Please provide a valid delivery address.' });
    }

    if (!paymentMethod || !['mpesa', 'airtel_money', 'cash_on_delivery'].includes(paymentMethod)) {
      return res.status(400).json({ error: 'Please select a valid payment method.' });
    }

    if (paymentMethod !== 'cash_on_delivery' && (!paymentPhone || !paymentPhone.trim())) {
      return res.status(400).json({ error: 'Please provide a phone number for mobile money payment.' });
    }

    console.log('Creating order for userId:', userId);
    console.log('Items received:', items);

    const findMenuByName = async (name) => {
      if (!name || typeof name !== 'string') return null;
      const cleanName = name.trim();
      if (!cleanName) return null;
      const escapedName = escapeRegex(cleanName);
      return await Menu.findOne({ name: { $regex: `^${escapedName}$`, $options: 'i' } });
    };

    const normalizeName = (name) => {
      if (!name) return '';
      return name.toLowerCase().replace(/[^a-z0-9 ]+/g, '').replace(/\s+/g, ' ').trim();
    };

    // Calculate total amount
    let totalAmount = 0;
    const orderItems = [];

    for (const item of items) {
      let menu = null;

      // Try to find menu by MongoDB ObjectId if provided
      if (typeof item.menuId === 'string' && mongoose.isValidObjectId(item.menuId)) {
        menu = await Menu.findById(item.menuId);
        console.log(`Found menu by ID ${item.menuId}:`, menu?.name);
      } else if (item.menuId) {
        console.log(`Skipping invalid menuId for ObjectId lookup:`, item.menuId);
      }

      // If not found by ID, try finding by exact name
      if (!menu && item.name) {
        menu = await findMenuByName(item.name);
        console.log(`Found menu by exact name "${item.name}":`, menu?.name);

        // If still not found, try normalized-name lookup to catch spacing/case/punctuation variants
        if (!menu) {
          const target = normalizeName(item.name);
          const allMenus = await Menu.find();
          const matched = allMenus.find(m => normalizeName(m.name) === target);
          if (matched) {
            menu = matched;
            console.log(`Found menu by normalized name "${item.name}" -> "${matched.name}":`, matched._id);
          }
        }
      }

      // If still not found, create a new menu item
      if (!menu) {
        console.log(`Creating new menu item for: ${item.name}`);
        menu = new Menu({
          name: item.name,
          description: item.description || '',
          price: item.price || 0,
          category: item.category || 'Food',
          image: item.image || '',
          availability: true
        });
        await menu.save();
        console.log(`Created new menu item: ${menu._id} - ${menu.name}`);
      }

      const quantity = item.quantity || 1;
      const itemPrice = typeof menu.price === 'number' ? menu.price : Number(item.price) || 0;
      totalAmount += itemPrice * quantity;
      
      orderItems.push({
        menu: menu._id,
        name: item.name || menu.name,
        description: item.description || menu.description || '',
        category: item.category || menu.category || 'Food',
        image: item.image || menu.image || '',
        quantity,
        price: itemPrice,
        specialInstructions: item.specialInstructions
      });
    }

    // Generate order number
    const orderNumber = `ORD-${Date.now()}`;

    // Create order
    const order = new Order({
      orderNumber,
      customer: userId,
      items: orderItems,
      totalAmount,
      deliveryAddress: { street: deliveryAddress },
      paymentMethod,
      notes
    });

    await order.save();

    console.log('Order saved successfully:', order._id, 'for customer:', order.customer);

    // Create payment record
    const payment = new Payment({
      order: order._id,
      user: userId,
      amount: totalAmount,
      paymentMethod,
      paymentPhone,
      transactionId: paymentMethod === 'cash_on_delivery' ? 'COD' : undefined,
      paymentProvider: paymentMethod === 'cash_on_delivery' ? { name: 'Cash on Delivery', reference: 'COD' } : undefined,
      status: paymentMethod === 'cash_on_delivery' ? 'pending' : 'pending'
    });

    await payment.save();

    if (paymentMethod !== 'cash_on_delivery' && paymentPhone) {
      try {
        const paymentResponse = paymentMethod === 'mpesa'
          ? await initiateMpesaPayment(paymentPhone, totalAmount, order._id)
          : await initiateAirtelPayment(paymentPhone, totalAmount, order._id);

        payment.transactionId = paymentResponse.transactionId;
        payment.paymentProvider = {
          name: paymentMethod,
          reference: paymentResponse.reference,
          timestamp: new Date()
        };
        await payment.save();
      } catch (paymentError) {
        console.warn('Payment initiation failed:', paymentError.message || paymentError);
      }

      try {
        await sendSMS(paymentPhone, `Your order ${order.orderNumber} has been placed. A ${paymentMethod === 'mpesa' ? 'M-Pesa' : 'Airtel Money'} payment prompt has been sent to your phone.`);
      } catch (smsError) {
        console.warn('Payment notification SMS failed:', smsError.message || smsError);
      }
    }

    res.status(201).json({
      message: 'Order created successfully',
      _id: order._id,
      orderId: order._id,
      orderNumber: order.orderNumber,
      totalAmount: order.totalAmount,
      status: order.status,
      paymentId: payment._id
    });
  } catch (error) {
    console.error('Order creation error:', error.message);
    console.error('Error stack:', error.stack);
    const errorMessage = error.message || 'Failed to create order';
    res.status(500).json({ error: errorMessage });
  }
};

export const getUserOrders = async (req, res) => {
  try {
    const userId = req.userId;
    console.log('Fetching orders for userId:', userId);
    const orders = await Order.find({ customer: userId })
      .populate('items.menu')
      .populate('driver', 'name phone')
      .sort({ createdAt: -1 });

    console.log('Found', orders.length, 'orders for user', userId);
    res.json(orders);
  } catch (error) {
    console.error('Error fetching user orders:', error.message);
    res.status(500).json({ error: error.message });
  }
};

export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('items.menu')
      .populate('customer', 'name phone email')
      .populate('driver', 'name phone');

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Check if user has access to this order
    if (order.customer._id.toString() !== req.userId && req.userRole !== 'admin' && req.userRole !== 'driver') {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateOrder = async (req, res) => {
  try {
    const { status, driverId } = req.body;
    const orderId = req.params.id;

    const update = { status, updatedAt: Date.now() };
    if (driverId) update.driver = driverId;
    if (status === 'delivered') update.actualDeliveryTime = new Date();

    const order = await Order.findByIdAndUpdate(
      orderId,
      update,
      { new: true }
    ).populate('customer');

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Send SMS notification
    if (status === 'confirmed') {
      await sendSMS(order.customer.phone, `Your order ${order.orderNumber} has been confirmed!`);
    } else if (status === 'out_for_delivery') {
      await sendSMS(order.customer.phone, `Your order is out for delivery!`);
    } else if (status === 'delivered') {
      await sendSMS(order.customer.phone, `Your order has been delivered!`);
    }

    req.io?.to(`order_${order._id}`).emit('order_status_updated', {
      orderId: order._id,
      status: order.status,
      orderNumber: order.orderNumber,
      driver: order.driver ? { name: order.driver.name, phone: order.driver.phone, email: order.driver.email } : undefined
    });

    res.json({ message: 'Order updated', order });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const cancelOrder = async (req, res) => {
  try {
    const orderId = req.params.id;

    const order = await Order.findByIdAndUpdate(
      orderId,
      { status: 'cancelled', updatedAt: Date.now() },
      { new: true }
    ).populate('customer');

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    await sendSMS(order.customer.phone, `Your order ${order.orderNumber} has been cancelled.`);
    req.io?.to(`order_${order._id}`).emit('order_status_updated', {
      orderId: order._id,
      status: order.status,
      orderNumber: order.orderNumber
    });

    res.json({ message: 'Order cancelled', order });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};