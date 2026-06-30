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
  { name: 'Delmonte', description: 'Cold seasonal fresh juice', price: 400, category: 'Soft Drinks', image: 'https://via.placeholder.com/200' },
  { name: 'Minute Maid 400Ml', description: 'Chilled Local Minute Maid', price: 100, category: 'Soft Drinks', image: 'https://via.placeholder.com/200' },
  { name: 'Minute Maid 1L', description: 'Cold', price: 250, category: 'Soft drinks', image: 'https://via.placeholder.com/200' },
  { name: 'Soda 500Ml', description: 'Cold soda', price: 100, category: 'Soft drinks', image: 'https://via.placeholder.com/200' },
  { name: 'Afia', description: 'Fresh Juice', price: 100, category: 'Soft drinks', image: 'https://via.placeholder.com/200' },
  { name: 'Monster', description: 'Energy drink', price: 300, category: 'Soft Drinks', image: 'https://via.placeholder.com/200' },
  { name: 'RedBull', description: 'Energy drink', price: 300, category: 'Soft Drinks', image: 'https://via.placeholder.com/200' },
  { name: 'Predator', description: 'Energy drink', price: 100, category: 'Soft Drinks', image: 'https://via.placeholder.com/200' },
  { name: 'Power Play', description: 'Energy drink', price: 100, category: 'Soft Drinks', image: 'https://via.placeholder.com/200' },
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
  { name: 'Tusker Lager', description: 'Local craft beer Can', price: 300, category: 'Wines and Beers', image: 'https://via.placeholder.com/200' },
  { name: 'WhiteCap', description: 'Local craft beer Can', price: 300, category: 'Wines and Beers', image: 'https://via.placeholder.com/200' },
  { name: 'Tusker Cider', description: 'Local craft beer Can', price: 300, category: 'Wines and Beers', image: 'https://via.placeholder.com/200' },
  { name: 'Guiness', description: 'Local craft beer Can', price: 300, category: 'Wines and Beers', image: 'https://via.placeholder.com/200' },
  { name: 'Balozi', description: 'Local craft beer Can', price: 300, category: 'Wines and Beers', image: 'https://via.placeholder.com/200' },
  { name: 'Smirnof Guarana', description: 'Local craft beer Can', price: 300, category: 'Wines and Beers', image: 'https://via.placeholder.com/200' },
  { name: 'Snap', description: 'Local craft beer Can', price: 300, category: 'Wines and Beers', image: 'https://via.placeholder.com/200' },

  // Liquor items
  { name: 'Johnny Walker Black 1L', description: 'Premium blended whisky', price: 5500, category: 'Liquor', image: 'https://via.placeholder.com/200' },
  { name: 'Johnny Walker Black 3/4', description: 'Premium blended whisky', price: 4800, category: 'Liquor', image: 'https://via.placeholder.com/200' },
  { name: 'Johnny Walker Red 1L', description: 'Smooth blended whisky', price: 3200, category: 'Liquor', image: 'https://via.placeholder.com/200' },
  { name: 'Johnny Walker Red 3/4', description: 'Smooth blended whisky', price: 2600, category: 'Liquor', image: 'https://via.placeholder.com/200' },
  { name: 'Red Label', description: 'Blended whisky', price: 3000, category: 'Liquor', image: 'https://via.placeholder.com/200' },
  { name: 'Grants 1L', description: 'Classic blended whisky', price: 3000, category: 'Liquor', image: 'https://via.placeholder.com/200' },
  { name: 'Grants 3/4', description: 'Classic blended whisky', price: 2500, category: 'Liquor', image: 'https://via.placeholder.com/200' },
  { name: 'Jack Daniels 3/4', description: 'Tennessee whiskey', price: 4000, category: 'Liquor', image: 'https://via.placeholder.com/200' },
  { name: 'Martell VS 700ml', description: 'Fine cognac', price: 7000, category: 'Liquor', image: 'https://via.placeholder.com/200' },
  { name: 'Martell VS 1L', description: 'Fine cognac', price: 7800, category: 'Liquor', image: 'https://via.placeholder.com/200' },
  { name: 'Hennessy', description: 'Premium cognac', price: 6500, category: 'Liquor', image: 'https://via.placeholder.com/200' },
  { name: 'Glenfiddich 12yrs 750ml', description: 'Single malt whisky', price: 8500, category: 'Liquor', image: 'https://via.placeholder.com/200' },
  { name: 'Glenfiddich 15yrs 750ml', description: 'Single malt whisky', price: 12000, category: 'Liquor', image: 'https://via.placeholder.com/200' },
  { name: 'Ballantines', description: 'Blended Scotch whisky', price: 3500, category: 'Liquor', image: 'https://via.placeholder.com/200' },
  { name: 'VAT69 760ml', description: 'Blended whisky', price: 1900, category: 'Liquor', image: 'https://via.placeholder.com/200' },
  { name: 'Best Cream 750ml', description: 'Cream liqueur', price: 1500, category: 'Liquor', image: 'https://via.placeholder.com/200' },
  { name: "Bailey's Cream 750ml", description: 'Cream liqueur', price: 3000, category: 'Liquor', image: 'https://via.placeholder.com/200' },
  { name: "Gordon's Gin 1L", description: 'Dry gin', price: 3200, category: 'Liquor', image: 'https://via.placeholder.com/200' },
  { name: "Gordon's Gin 750ml", description: 'Dry gin', price: 2500, category: 'Liquor', image: 'https://via.placeholder.com/200' },
  { name: 'Chivas Regal 12yrs', description: 'Premium blended Scotch', price: 5000, category: 'Liquor', image: 'https://via.placeholder.com/200' },
  { name: 'William Lawsons 750ml', description: 'Blended whisky', price: 2500, category: 'Liquor', image: 'https://via.placeholder.com/200' },
  { name: 'Amarula 750ml', description: 'Cream liqueur', price: 3000, category: 'Liquor', image: 'https://via.placeholder.com/200' },
  { name: 'Viceroy 3/4', description: 'Blended whisky', price: 1650, category: 'Liquor', image: 'https://via.placeholder.com/200' },
  { name: 'Black and White 3/4', description: 'Blended whisky', price: 1500, category: 'Liquor', image: 'https://via.placeholder.com/200' },
  { name: 'VAT 69 3/4', description: 'Blended whisky', price: 1900, category: 'Liquor', image: 'https://via.placeholder.com/200' },
  { name: 'VAT 69 1L', description: 'Blended whisky', price: 3000, category: 'Liquor', image: 'https://via.placeholder.com/200' },
  { name: 'Singleton 12 Years', description: 'Single malt whisky', price: 6500, category: 'Liquor', image: 'https://via.placeholder.com/200' },
  { name: 'Richot 3/4', description: 'Blended whisky', price: 1600, category: 'Liquor', image: 'https://via.placeholder.com/200' },
  { name: 'Hunters Choice 3/4', description: 'Blended whisky', price: 1300, category: 'Liquor', image: 'https://via.placeholder.com/200' },
  { name: 'Captain Morgan 3/4', description: 'Spiced rum', price: 1300, category: 'Liquor', image: 'https://via.placeholder.com/200' },
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
