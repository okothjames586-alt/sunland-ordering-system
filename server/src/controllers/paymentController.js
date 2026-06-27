import Payment from '../models/Payment.js';
import Order from '../models/Order.js';
import { initiateMpesaPayment, initiateAirtelPayment } from '../services/paymentService.js';
import { sendSMS } from '../services/smsService.js';

export const initiatePayment = async (req, res) => {
  try {
    const { orderId, paymentMethod, phone } = req.body;
    const userId = req.userId;

    // Get order
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Get payment record
    let payment = await Payment.findOne({ order: orderId });
    if (!payment) {
      return res.status(404).json({ error: 'Payment record not found' });
    }

    let paymentResponse;

    if (paymentMethod === 'mpesa') {
      paymentResponse = await initiateMpesaPayment(phone, order.totalAmount, orderId);
    } else if (paymentMethod === 'airtel_money') {
      paymentResponse = await initiateAirtelPayment(phone, order.totalAmount, orderId);
    } else if (paymentMethod === 'cash_on_delivery') {
      payment.status = 'pending';
      await payment.save();

      await sendSMS(phone, `Order ${order.orderNumber} confirmed. You will pay KES ${order.totalAmount} on delivery.`);

      return res.json({
        message: 'Cash on delivery order created',
        paymentId: payment._id,
        status: 'pending'
      });
    } else {
      return res.status(400).json({ error: 'Invalid payment method' });
    }

    payment.transactionId = paymentResponse.transactionId;
    payment.status = 'pending';
    payment.paymentProvider = {
      name: paymentMethod,
      reference: paymentResponse.reference,
      timestamp: new Date()
    };

    await payment.save();

    res.json({
      message: 'Payment initiated',
      paymentId: payment._id,
      transactionId: paymentResponse.transactionId
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const paymentCallback = async (req, res) => {
  try {
    console.log('Payment callback received:', JSON.stringify(req.body, null, 2));

    // M-Pesa Daraja STK Push Callback Format
    const body = req.body.Body;
    
    if (!body) {
      console.warn('Invalid callback format - missing Body');
      return res.status(400).json({ ResultCode: 1, ResultDesc: 'Invalid callback format' });
    }

    const stkCallback = body.stkCallback;
    const merchantRequestID = stkCallback?.MerchantRequestID;
    const checkoutRequestID = stkCallback?.CheckoutRequestID;
    const resultCode = stkCallback?.ResultCode;
    const resultDesc = stkCallback?.ResultDesc;
    const callbackMetadata = stkCallback?.CallbackMetadata;

    console.log(`STK Callback - RequestID: ${merchantRequestID}, CheckoutID: ${checkoutRequestID}, ResultCode: ${resultCode}`);

    // Find payment by checkout request ID or merchant request ID
    let payment = await Payment.findOne({
      $or: [
        { transactionId: checkoutRequestID },
        { 'paymentProvider.reference': checkoutRequestID },
        { 'paymentProvider.reference': merchantRequestID }
      ]
    });

    if (!payment) {
      console.warn(`Payment not found for CheckoutRequestID: ${checkoutRequestID}`);
      // Still return success to acknowledge receipt to M-Pesa
      return res.status(200).json({ 
        ResultCode: 0, 
        ResultDesc: 'Callback received' 
      });
    }

    // Extract payment details from callback
    let amount = null;
    let mpesaReceiptNumber = null;
    let phoneNumber = null;
    let transactionDate = null;

    if (resultCode === 0 && callbackMetadata) {
      // Payment successful - extract metadata
      const metadata = callbackMetadata.Item;
      
      if (Array.isArray(metadata)) {
        metadata.forEach((item) => {
          if (item.Name === 'Amount') amount = item.Value;
          if (item.Name === 'MpesaReceiptNumber') mpesaReceiptNumber = item.Value;
          if (item.Name === 'PhoneNumber') phoneNumber = item.Value;
          if (item.Name === 'TransactionDate') transactionDate = item.Value;
        });
      }
    }

    // Update payment status
    const paymentStatus = resultCode === 0 ? 'completed' : 'failed';
    payment.status = paymentStatus;
    payment.paymentProvider = payment.paymentProvider || {};
    payment.paymentProvider.resultCode = resultCode;
    payment.paymentProvider.resultDesc = resultDesc;
    payment.paymentProvider.mpesaReceiptNumber = mpesaReceiptNumber;
    payment.paymentProvider.phoneNumber = phoneNumber;
    payment.paymentProvider.transactionDate = transactionDate;
    payment.paymentProvider.callbackReceivedAt = new Date();

    await payment.save();

    // Update order payment status
    const order = await Order.findByIdAndUpdate(
      payment.order,
      { paymentStatus: paymentStatus },
      { new: true }
    ).populate('customer');

    if (!order) {
      console.warn(`Order not found for payment: ${payment._id}`);
      return res.status(200).json({ 
        ResultCode: 0, 
        ResultDesc: 'Callback processed' 
      });
    }

    console.log(`Order ${order._id} payment status updated to: ${paymentStatus}`);

    // Emit socket event and/or send SMS notification
    if (paymentStatus === 'completed') {
      try {
        req.io.to(`order_${order._id}`).emit('payment_confirmed', {
          orderId: order._id,
          orderNumber: order.orderNumber,
          amount: amount || order.totalAmount,
          mpesaReceiptNumber,
          message: `Payment received for order ${order.orderNumber}. Your order is being prepared!`
        });
        console.log(`Socket event sent for order ${order._id}`);
      } catch (e) {
        console.warn('Socket emit failed for payment_confirmed:', e.message || e);
        try {
          await sendSMS(
            order.customer.phone,
            `Payment received for order ${order.orderNumber}. Your order is being prepared!`
          );
          console.log(`Fallback SMS sent to ${order.customer.phone}`);
        } catch (smsErr) {
          console.warn('Fallback SMS failed:', smsErr.message || smsErr);
        }
      }
    } else {
      try {
        req.io.to(`order_${order._id}`).emit('payment_failed', {
          orderId: order._id,
          orderNumber: order.orderNumber,
          resultDesc: resultDesc,
          message: `Payment failed for order ${order.orderNumber}. Reason: ${resultDesc}`
        });
        console.log(`Socket event sent for failed payment on order ${order._id}`);
      } catch (e) {
        console.warn('Socket emit failed for payment_failed:', e.message || e);
        try {
          await sendSMS(
            order.customer.phone,
            `Payment failed for order ${order.orderNumber}. Please try again.`
          );
          console.log(`Fallback SMS sent for failed payment to ${order.customer.phone}`);
        } catch (smsErr) {
          console.warn('Fallback SMS failed:', smsErr.message || smsErr);
        }
      }
    }

    // Return success to M-Pesa
    res.status(200).json({ 
      ResultCode: 0, 
      ResultDesc: 'Callback processed successfully' 
    });
  } catch (error) {
    console.error('Payment callback error:', error);
    // Still return 200 to M-Pesa to prevent retries
    res.status(200).json({ 
      ResultCode: 1, 
      ResultDesc: 'Internal server error' 
    });
  }
};

export const getPaymentDetails = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id).populate('order');

    if (!payment) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    res.json(payment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};