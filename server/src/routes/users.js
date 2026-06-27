import express from 'express';
import * as userController from '../controllers/userController.js';
import authMiddleware from '../middleware/auth.js';

const router = express.Router();

router.get('/profile', authMiddleware, userController.getProfile);
router.put('/profile', authMiddleware, userController.updateProfile);
router.get('/:id', authMiddleware, userController.getUserById);
router.put('/:id', authMiddleware, userController.updateUser);
router.get('/:id/cart', authMiddleware, userController.getUserCart);
router.post('/:id/cart', authMiddleware, userController.addToCart);
router.delete('/:id/cart/:itemId', authMiddleware, userController.removeFromCart);

export default router;