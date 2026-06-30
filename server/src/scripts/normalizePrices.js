import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Menu from '../models/Menu.js';

dotenv.config();

const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/sunland-ordering';

function normalizeName(name) {
  if (!name) return '';
  return name
    .toLowerCase()
    .replace(/[^a-z0-9 ]+/g, '') // remove punctuation
    .replace(/\s+/g, ' ') // collapse spaces
    .trim();
}

async function run() {
  try {
    await mongoose.connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('Connected to MongoDB');

    const menus = await Menu.find();
    const groups = new Map();

    menus.forEach((m) => {
      const key = normalizeName(m.name);
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push(m);
    });

    for (const [key, items] of groups.entries()) {
      if (!key) continue;
      if (items.length < 2) continue; // nothing to normalize

      // Choose canonical price: the most common price in the group
      const priceCounts = {};
      items.forEach(i => {
        const p = typeof i.price === 'number' ? i.price : Number(i.price) || 0;
        priceCounts[p] = (priceCounts[p] || 0) + 1;
      });
      const sortedPrices = Object.keys(priceCounts).sort((a, b) => priceCounts[b] - priceCounts[a]);
      const canonicalPrice = Number(sortedPrices[0]);

      // Update all items in group to canonical price if different
      for (const item of items) {
        if (item.price !== canonicalPrice) {
          await Menu.updateOne({ _id: item._id }, { $set: { price: canonicalPrice } });
          console.log(`Updated ${item.name} (${item._id}) price ${item.price} -> ${canonicalPrice}`);
        }
      }
    }

    console.log('Price normalization complete.');
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('Error during price normalization:', err);
    process.exit(1);
  }
}

run();
