import mongoose from 'mongoose';
import Order from '../src/models/Order.js';

const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/sunland-ordering';

async function main() {
  try {
    await mongoose.connect(mongoUri, { dbName: 'sunland-ordering' });
    const count = await Order.countDocuments();
    console.log('orderCount=', count);

    const orders = await Order.find().limit(10).lean();
    console.log(JSON.stringify(orders, null, 2));
  } catch (error) {
    console.error('ERROR:', error);
  } finally {
    await mongoose.disconnect();
  }
}

main();
