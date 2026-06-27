import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Menu from '../models/Menu.js';

dotenv.config();

const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/sunland-ordering';

const items = [
  // Food items
  { name: 'Fish Boil', description: 'Fresh fish boiled to perfection', price: 300, category: 'Food', image: 'https://via.placeholder.com/200' },
  { name: 'Fish Dry Fry', description: 'Crispy dry fried fish', price: 300, category: 'Food', image: 'https://via.placeholder.com/200' },
  { name: 'Fish Wet Fry', description: 'Juicy wet fried fish', price: 300, category: 'Food', image: 'https://via.placeholder.com/200' },
  { name: 'Fish Plain', description: 'Extra large fish', price: 350, category: 'Food', image: 'https://via.placeholder.com/200' },
  { name: 'Mbuzi choma 1/4', description: 'Choma roasted to perfection', price: 350, category: 'Food', image: 'https://via.placeholder.com/200' },
  { name: 'Mbuzi Wet Fry', description: 'Crispy wet fried mbuzi', price: 300, category: 'Food', image: 'https://via.placeholder.com/200' },
  { name: 'Chicken Wet Fry 1/4', description: 'Grilled chicken dish', price: 350, category: 'Food', image: 'https://via.placeholder.com/200' },
  { name: 'Chicken Stew', description: 'African Spiced dish', price: 350, category: 'Food', image: 'https://via.placeholder.com/200' },
  { name: 'Chicken Full', description: 'Grilled chicken dish', price: 1600, category: 'Food', image: 'https://via.placeholder.com/200' },
  { name: 'Beef Stew', description: 'Rich beef stew with vegetables', price: 300, category: 'Food', image: 'https://via.placeholder.com/200' },
  { name: 'Ugali plain', description: 'Traditional maize meal', price: 50, category: 'Food', image: 'https://via.placeholder.com/200' },
  { name: 'Chapati', description: 'Fluffy flatbread', price: 50, category: 'Food', image: 'https://via.placeholder.com/200' },
  { name: 'Chips', description: 'Plain fried chips', price: 150, category: 'Food', image: 'https://via.placeholder.com/200' },
  { name: 'Matumbo', description: 'Spiced Fresh Matumbo', price: 200, category: 'Food', image: 'https://via.placeholder.com/200' },
  
  // Soft drinks
  { name: 'Delmonte', description: 'Cold seasonal fresh juice', price: 350, category: 'Soft drinks', image: 'https://via.placeholder.com/200' },
  { name: 'Minute Maid 400Ml', description: 'Chilled Local Minute Maid', price: 100, category: 'Soft drinks', image: 'https://via.placeholder.com/200' },
  { name: 'Minute Maid 1L', description: 'Cold', price: 250, category: 'Soft drinks', image: 'https://via.placeholder.com/200' },
  { name: 'Soda 500Ml', description: 'Cold soda', price: 100, category: 'Soft drinks', image: 'https://via.placeholder.com/200' },
  { name: 'Afia', description: 'Fresh Juice', price: 100, category: 'Soft drinks', image: 'https://via.placeholder.com/200' },
  { name: 'Monster', description: 'Energy drink', price: 250, category: 'Soft drinks', image: 'https://via.placeholder.com/200' },
  { name: 'RedBull', description: 'Energy drink', price: 250, category: 'Soft drinks', image: 'https://via.placeholder.com/200' },
  { name: 'Dasani 500Ml', description: 'Pure Bottled water', price: 50, category: 'Soft drinks', image: 'https://via.placeholder.com/200' },
  { name: 'Dasani 1L', description: 'Pure bottled water', price: 100, category: 'Soft drinks', image: 'https://via.placeholder.com/200' },
  { name: 'Keringet 500Ml', description: 'Chilled mineral water', price: 100, category: 'Soft drinks', image: 'https://via.placeholder.com/200' },
  { name: 'Keringet 1L', description: 'Pure bottled water', price: 150, category: 'Soft drinks', image: 'https://via.placeholder.com/200' },
  
  // Wines and Beers
  { name: 'Robertson 750Ml', description: 'Smooth red wine', price: 1800, category: 'Wines and Beers', image: 'https://via.placeholder.com/200' },
  { name: 'Four Cousins Red', description: 'Red wine', price: 1300, category: 'Wines and Beers', image: 'https://via.placeholder.com/200' },
  { name: 'Four Cousins White', description: 'White wine', price: 1300, category: 'Wines and Beers', image: 'https://via.placeholder.com/200' },
  { name: 'Fourth Street Red', description: 'Red wine', price: 1300, category: 'Wines and Beers', image: 'https://via.placeholder.com/200' },
  { name: 'Fourth Street White', description: 'White wine', price: 1300, category: 'Wines and Beers', image: 'https://via.placeholder.com/200' },
  { name: 'Cellar Cask Red', description: 'Red wine', price: 1400, category: 'Wines and Beers', image: 'https://via.placeholder.com/200' },
  { name: 'Cellar Cask White', description: 'White wine', price: 1400, category: 'Wines and Beers', image: 'https://via.placeholder.com/200' },
  { name: 'Caprice Red', description: 'Red wine', price: 1300, category: 'Wines and Beers', image: 'https://via.placeholder.com/200' },
  { name: 'Caprice White', description: 'White wine', price: 1300, category: 'Wines and Beers', image: 'https://via.placeholder.com/200' },
  { name: 'Drostdy Hof', description: 'Red Wine', price: 1400, category: 'Wines and Beers', image: 'https://via.placeholder.com/200' },
  { name: 'Tusker Lite', description: 'Local craft beer Can', price: 300, category: 'Wines and Beers', image: 'https://via.placeholder.com/200' },
  { name: 'Tusker Lager', description: 'Local craft beer Can', price: 250, category: 'Wines and Beers', image: 'https://via.placeholder.com/200' },
  { name: 'WhiteCap', description: 'Local craft beer Can', price: 300, category: 'Wines and Beers', image: 'https://via.placeholder.com/200' },
  { name: 'Tusker Cider', description: 'Local craft beer Can', price: 300, category: 'Wines and Beers', image: 'https://via.placeholder.com/200' },
  { name: 'Guiness', description: 'Local craft beer Can', price: 300, category: 'Wines and Beers', image: 'https://via.placeholder.com/200' },
  { name: 'Balozi', description: 'Local craft beer Can', price: 250, category: 'Wines and Beers', image: 'https://via.placeholder.com/200' },
  { name: 'Smirnof Guarana', description: 'Local craft beer Can', price: 250, category: 'Wines and Beers', image: 'https://via.placeholder.com/200' },
  { name: 'Snap', description: 'Local craft beer Can', price: 250, category: 'Wines and Beers', image: 'https://via.placeholder.com/200' },
];

async function run() {
  try {
    await mongoose.connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('Connected to MongoDB');

    for (const item of items) {
      const filter = { name: item.name };
      const update = { $set: { description: item.description, price: item.price, category: item.category, image: item.image, availability: true } };
      const opts = { upsert: true, new: true };
      const res = await Menu.findOneAndUpdate(filter, update, opts);
      console.log(`Upserted: ${res.name} (${res._id})`);
    }

    await mongoose.disconnect();
    console.log('Done.');
    process.exit(0);
  } catch (err) {
    console.error('Seeding error:', err);
    process.exit(1);
  }
}

run();
