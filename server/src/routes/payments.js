import express from 'express';
import * as paymentController from '../controllers/paymentController.js';
import { generateMpesaAccessToken } from '../services/paymentService.js';
import authMiddleware from '../middleware/auth.js';

const router = express.Router();

router.post('/initiate', authMiddleware, paymentController.initiatePayment);
router.post('/callback', paymentController.paymentCallback);
router.get('/:id', authMiddleware, paymentController.getPaymentDetails);

/**
 * Generate M-Pesa access token
 * GET /api/payments/access-token?forceRefresh=true (optional)
 * Returns: { accessToken: string, expiresIn: number }
 */
router.get('/token/generate', async (req, res) => {
  try {
    const forceRefresh = req.query.forceRefresh === 'true';
    const accessToken = await generateMpesaAccessToken(forceRefresh);
    
    res.json({
      success: true,
      accessToken,
      expiresIn: 3600,
      message: 'Access token generated successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

export default router;