import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  orderNumber: {
    type: String,
    unique: true,
    required: true
  },
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  items: [
    {
      menu: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Menu',
        required: true
      },
      name: String,
      description: String,
      category: String,
      image: String,
      quantity: {
        type: Number,
        required: true,
        min: 1
      },
      price: Number,
      specialInstructions: String
    }
  ],
  totalAmount: {
    type: Number,
    required: true
  },
  deliveryAddress: {
    street: String,
    city: String,
    postalCode: String,
    coordinates: {
      latitude: Number,
      longitude: Number
    }
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'preparing', 'ready', 'out_for_delivery', 'delivered', 'cancelled'],
    default: 'pending'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'completed', 'failed'],
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    enum: ['mpesa', 'airtel_money', 'cash_on_delivery'],
    required: true
  },
  driver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  rider: {
    name: String,
    phone: String,
    email: String,
  },
  estimatedDeliveryTime: Date,
  actualDeliveryTime: Date,
  notes: String,
  rating: {
    type: Number,
    min: 1,
    max: 5
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model('Order', orderSchema);