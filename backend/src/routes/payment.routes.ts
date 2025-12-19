import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import {
  createPaymentIntent,
  getPaymentStatus
} from '../controllers/payment.controller';

const router = Router();

// Webhook route is registered directly in index.ts with raw body parser

// Protected routes
router.use(authenticate);

router.post('/create-payment-intent', createPaymentIntent);
router.get('/:paymentId/status', getPaymentStatus);

export default router;
