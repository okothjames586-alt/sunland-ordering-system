import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Menu from '../models/Menu.js';

dotenv.config();

const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/sunland-ordering';

async function run() {
  try {
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    const imagePath = '/images/chicken%20full.webp';
    const res = await Menu.findOneAndUpdate(
      { name: /kuku full/i },
      { $set: { image: imagePath } },
      { new: true }
    );

    if (!res) {
      console.log('Menu item "Kuku Full" not found.');
    } else {
      console.log(`Updated image for ${res.name}: ${res.image}`);
    }

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('Error updating image:', err);
    process.exit(1);
  }
}

run();
