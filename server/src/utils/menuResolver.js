import mongoose from 'mongoose';
import Menu from '../models/Menu.js';

// Resolve a menu item from flexible identifiers.
// Accepts ObjectId strings, numeric legacy IDs, or numeric indexes (1-based).
export async function resolveMenu(menuId) {
  if (!menuId && menuId !== 0) return null;

  // If it's a valid ObjectId, return by id
  if (typeof menuId === 'string' && mongoose.isValidObjectId(menuId)) {
    return await Menu.findById(menuId);
  }

  // If it's a number or numeric string, try legacyId then index fallback
  const asNumber = Number(menuId);
  if (!Number.isNaN(asNumber)) {
    // Try legacyId field first (if you have it)
    const byLegacy = await Menu.findOne({ legacyId: asNumber });
    if (byLegacy) return byLegacy;

    // Treat numeric id as 1-based index into menus sorted by createdAt
    if (asNumber >= 1) {
      const menu = await Menu.find().sort({ createdAt: 1 }).skip(asNumber - 1).limit(1);
      return menu && menu.length ? menu[0] : null;
    }
  }

  // As a last resort, try to find by name
  if (typeof menuId === 'string') {
    return await Menu.findOne({ name: menuId });
  }

  return null;
}

export default resolveMenu;
