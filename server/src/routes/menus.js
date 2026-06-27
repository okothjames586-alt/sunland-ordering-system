import express from 'express';
import * as menuController from '../controllers/menuController.js';

const router = express.Router();

router.get('/', menuController.getAllMenus);
router.get('/:id', menuController.getMenuById);
router.get('/category/:category', menuController.getMenusByCategory);

export default router;