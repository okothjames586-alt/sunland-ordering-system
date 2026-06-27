import Menu from '../models/Menu.js';

export const getAllMenus = async (req, res) => {
  try {
    const menus = await Menu.find().populate('restaurant');
    res.json(menus);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getMenuById = async (req, res) => {
  try {
    const menu = await Menu.findById(req.params.id).populate('restaurant');
    if (!menu) {
      return res.status(404).json({ error: 'Menu item not found' });
    }
    res.json(menu);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getMenusByCategory = async (req, res) => {
  try {
    const menus = await Menu.find({ category: req.params.category });
    res.json(menus);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};