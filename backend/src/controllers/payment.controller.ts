import { Request, Response, NextFunction } from 'express';
import { AppError } from '../middleware/error.middleware';
import { AuthRequest } from '../middleware/auth.middleware';
import { paymentService } from '../services/payment.service';

export const createPaymentIntent = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    console.log('🔵 createPaymentIntent called');
    console.log('Body:', req.body);
    console.log('User:', req.user);

    if (!req.user) {
      throw new AppError('Uživatel není autentizován', 401);
    }

    const { reservationId } = req.body;
    const result = await paymentService.createPaymentIntent(reservationId, req.user.userId);

    return res.json(result);
  } catch (error) {
    return next(error);
  }
};

export const handleWebhook = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const sig = req.headers['stripe-signature'];
    const result = await paymentService.handleWebhook(sig!, req.body as Buffer);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

export const getPaymentStatus = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      throw new AppError('Uživatel není autentizován', 401);
    }

    const { paymentId } = req.params;
    const payment = await paymentService.getPaymentStatus(
      paymentId,
      req.user.userId,
      req.user.role
    );

    res.json({ payment });
  } catch (error) {
    next(error);
  }
};
