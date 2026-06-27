import express from 'express';
import * as orderController from '../controllers/orderController.js';
import authMiddleware from '../middleware/auth.js';

const router = express.Router();

router.post('/', authMiddleware, orderController.createOrder);
router.get('/', authMiddleware, orderController.getUserOrders);
router.get('/:id', authMiddleware, orderController.getOrderById);
router.put('/:id', authMiddleware, orderController.updateOrder);
router.delete('/:id', authMiddleware, orderController.cancelOrder);

export default router;