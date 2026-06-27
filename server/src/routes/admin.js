import express from 'express';
import authMiddleware from '../middleware/auth.js';
import isAdmin from '../middleware/isAdmin.js';
import * as adminController from '../controllers/adminController.js';

const router = express.Router();

// All admin routes require authentication + admin role
router.use(authMiddleware, isAdmin);

// GET /api/admin/orders?status=pending
router.get('/orders', adminController.listOrders);

// PUT /api/admin/orders/:id/approve
router.put('/orders/:id/approve', adminController.approveOrder);

// PUT /api/admin/orders/:id/decline
router.put('/orders/:id/decline', adminController.declineOrder);

// PUT /api/admin/orders/:id/assign-driver
router.put('/orders/:id/assign-driver', adminController.assignDriver);

// PUT /api/admin/orders/:id/delivered
router.put('/orders/:id/delivered', adminController.markDelivered);
// alias path for mark delivered
router.put('/orders/:id/mark-delivered', adminController.markDelivered);

// DELETE /api/admin/orders/:id
router.delete('/orders/:id', adminController.deleteOrder);

// GET /api/admin/users
router.get('/users', adminController.listUsers);

// DELETE /api/admin/users/:id
router.delete('/users/:id', adminController.deleteUser);

export default router;
