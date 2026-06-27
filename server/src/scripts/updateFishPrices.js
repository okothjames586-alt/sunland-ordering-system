import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Menu from '../models/Menu.js';

dotenv.config();

const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/sunland-ordering';

async function run() {
  try {
    await mongoose.connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('Connected to MongoDB');

    // Update Fish Dry Fry
    const dryFryResult = await Menu.updateOne(
      { name: 'Fish Dry Fry' },
      { $set: { price: 300 } }
    );
    console.log('Updated Fish Dry Fry:', dryFryResult.modifiedCount > 0 ? 'Success' : 'Not found or already 300');

    // Update Fish Wet Fry
    const wetFryResult = await Menu.updateOne(
      { name: 'Fish Wet Fry' },
      { $set: { price: 300 } }
    );
    console.log('Updated Fish Wet Fry:', wetFryResult.modifiedCount > 0 ? 'Success' : 'Not found or already 300');

    // Verify the updates
    const fishItems = await Menu.find({ $or: [{ name: 'Fish Dry Fry' }, { name: 'Fish Wet Fry' }] });
    console.log('\nCurrent prices:');
    fishItems.forEach(item => {
      console.log(`${item.name}: ${item.price}`);
    });

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('Error updating fish prices:', err);
    process.exit(1);
  }
}

run();
