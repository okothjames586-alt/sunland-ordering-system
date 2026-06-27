import mongoose from 'mongoose';
import User from '../models/User.js';
import Cart from '../models/Cart.js';
import Menu from '../models/Menu.js';
import resolveMenu from '../utils/menuResolver.js';

export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { name, email, phone, address, profilePicture } = req.body;

    const user = await User.findByIdAndUpdate(
      req.userId,
      { name, email, phone, address, profilePicture, updatedAt: Date.now() },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ message: 'Profile updated', user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateUser = async (req, res) => {
  try {
    const { name, phone, address, profilePicture } = req.body;

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { name, phone, address, profilePicture, updatedAt: Date.now() },
      { new: true }
    ).select('-password');

    res.json({ message: 'User updated', user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getUserCart = async (req, res) => {
  try {
    let cart = await Cart.findOne({ user: req.params.id }).populate('items.menu');

    if (!cart) {
      cart = new Cart({ user: req.params.id, items: [] });
      await cart.save();
    }

    res.json(cart);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const addToCart = async (req, res) => {
  try {
    const { menuId, quantity, specialInstructions } = req.body;
    const userId = req.params.id;

    // Resolve menu using flexible identifiers (ObjectId, legacy numeric id, or index)
    const menu = await resolveMenu(menuId);
    if (!menu) {
      return res.status(404).json({ error: 'Menu item not found' });
    }

    let cart = await Cart.findOne({ user: userId });

    if (!cart) {
      cart = new Cart({ user: userId, items: [] });
    }

    // Check if item already in cart
    const existingItem = cart.items.find(item => item.menu.toString() === String(menuId));

    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      cart.items.push({
        menu: menu._id,
        quantity,
        specialInstructions
      });
    }

    // Recalculate total
    cart.totalPrice = 0;
    for (const item of cart.items) {
      const menuItem = await Menu.findById(item.menu);
      if (menuItem) cart.totalPrice += menuItem.price * item.quantity;
    }

    await cart.save();

    res.json({ message: 'Item added to cart', cart });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const removeFromCart = async (req, res) => {
  try {
    const { id: userId, itemId } = req.params;

    const cart = await Cart.findOne({ user: userId });

    if (!cart) {
      return res.status(404).json({ error: 'Cart not found' });
    }

    cart.items = cart.items.filter(item => item._id.toString() !== itemId);

    // Recalculate total
    cart.totalPrice = 0;
    for (const item of cart.items) {
      const menu = await Menu.findById(item.menu);
      cart.totalPrice += menu.price * item.quantity;
    }

    await cart.save();

    res.json({ message: 'Item removed from cart', cart });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};