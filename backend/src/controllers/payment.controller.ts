import { Request, Response, NextFunction } from 'express';
import Stripe from 'stripe';
import prisma from '../config/database';
import { AppError } from '../middleware/error.middleware';
import { AuthRequest } from '../middleware/auth.middleware';

if (!process.env.STRIPE_SECRET_KEY) {
  console.error('❌ STRIPE_SECRET_KEY není nastavený v .env souboru!');
  console.error('Přidejte do backend/.env: STRIPE_SECRET_KEY=sk_test_...');
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16'
});

export const createPaymentIntent = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    console.log('🔵 createPaymentIntent called');
    console.log('Body:', req.body);
    console.log('User:', req.user);

    if (!process.env.STRIPE_SECRET_KEY) {
      throw new AppError('Stripe není nakonfigurován. Kontaktujte administrátora.', 500);
    }

    if (!req.user) {
      throw new AppError('Uživatel není autentizován', 401);
    }

    const { reservationId } = req.body;

    console.log('Creating payment intent for reservation:', reservationId);

    if (!reservationId) {
      throw new AppError('ID rezervace je povinné', 400);
    }

    const reservation = await prisma.reservation.findUnique({
      where: { id: reservationId },
      include: {
        event: true,
        payment: true
      }
    });

    if (!reservation) {
      console.log('Reservation not found:', reservationId);
      throw new AppError('Rezervace nebyla nalezena', 404);
    }

    console.log('Reservation found:', {
      id: reservation.id,
      status: reservation.status,
      userId: reservation.userId,
      totalAmount: reservation.totalAmount,
      hasPayment: !!reservation.payment
    });

    // Pokud je akce zdarma, nelze vytvořit payment intent
    if (Number(reservation.totalAmount) === 0) {
      console.log('❌ Cannot create payment intent for free reservation');
      throw new AppError('Akce je zdarma, platba není potřeba', 400);
    }

    if (reservation.userId !== req.user.userId) {
      console.log('❌ User mismatch');
      throw new AppError('Nemáte oprávnění k této rezervaci', 403);
    }

    if (reservation.status !== 'PENDING') {
      console.log('❌ Status not PENDING:', reservation.status);
      throw new AppError('Tuto rezervaci nelze zaplatit', 400);
    }

    console.log('✅ Reservation validation passed');

    // Check if payment already exists
    if (reservation.payment) {
      console.log('Payment already exists:', reservation.payment);
      
      // If payment is still pending, retrieve the existing payment intent
      if (reservation.payment.status === 'PENDING' && reservation.payment.stripePaymentId) {
        console.log('Attempting to retrieve existing payment intent:', reservation.payment.stripePaymentId);
        try {
          const existingIntent = await stripe.paymentIntents.retrieve(
            reservation.payment.stripePaymentId
          );
          
          console.log('Existing payment intent status:', existingIntent.status);
          
          // If payment intent is still usable, return it
          if (existingIntent.status === 'requires_payment_method' || 
              existingIntent.status === 'requires_confirmation' ||
              existingIntent.status === 'requires_action') {
            console.log('✅ Reusing existing payment intent');
            console.log('Returning clientSecret:', existingIntent.client_secret?.substring(0, 20) + '...');
            return res.json({
              clientSecret: existingIntent.client_secret,
              payment: reservation.payment
            });
          }
          console.log('⚠️ Payment intent not usable, creating new one');
        } catch (stripeError: any) {
          console.log('❌ Error retrieving payment intent:', stripeError.message);
          // If payment intent doesn't exist on Stripe, we'll create a new one
        }
      } else if (reservation.payment.status !== 'PENDING') {
        console.log('❌ Payment already completed/failed');
        throw new AppError('Platba již existuje', 400);
      }
    }

    // Create new Stripe payment intent
    console.log('Creating new payment intent for amount:', reservation.totalAmount);
    
    if (!process.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY === '') {
      console.log('❌ STRIPE_SECRET_KEY is not set!');
      throw new AppError('Platební brána není nakonfigurována. Kontaktujte administrátora.', 500);
    }
    
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(Number(reservation.totalAmount) * 100), // Convert to cents
      currency: 'czk',
      metadata: {
        reservationId: reservation.id,
        userId: req.user.userId,
        eventTitle: reservation.event.title
      }
    });
    
    console.log('✅ Payment intent created:', paymentIntent.id);

    // Create or update payment record
    const payment = reservation.payment 
      ? await prisma.payment.update({
          where: { id: reservation.payment.id },
          data: {
            stripePaymentId: paymentIntent.id,
            status: 'PENDING'
          }
        })
      : await prisma.payment.create({
          data: {
            reservationId: reservation.id,
            amount: reservation.totalAmount,
            stripePaymentId: paymentIntent.id,
            status: 'PENDING'
          }
        });

    return res.json({
      clientSecret: paymentIntent.client_secret,
      payment
    });
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

    if (!sig) {
      throw new AppError('Chybí Stripe signature', 400);
    }

    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!webhookSecret) {
      throw new AppError('Webhook secret není nastaven', 500);
    }

    // Verify webhook signature (req.body is Buffer from express.raw())
    const event = stripe.webhooks.constructEvent(
      req.body as Buffer,
      sig,
      webhookSecret
    );

    // Handle the event
    switch (event.type) {
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        const reservationId = paymentIntent.metadata.reservationId;

        // Update payment status
        await prisma.payment.updateMany({
          where: { stripePaymentId: paymentIntent.id },
          data: { status: 'COMPLETED', paymentMethod: paymentIntent.payment_method as string }
        });

        // Update reservation status
        await prisma.reservation.update({
          where: { id: reservationId },
          data: { status: 'CONFIRMED' }
        });

        break;
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;

        await prisma.payment.updateMany({
          where: { stripePaymentId: paymentIntent.id },
          data: { status: 'FAILED' }
        });

        break;
      }

      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    res.json({ received: true });
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

    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
      include: {
        reservation: {
          include: {
            event: true
          }
        }
      }
    });

    if (!payment) {
      throw new AppError('Platba nebyla nalezena', 404);
    }

    // Verify user owns this payment
    if (payment.reservation.userId !== req.user.userId && req.user.role !== 'ADMIN') {
      throw new AppError('Nemáte oprávnění k této platbě', 403);
    }

    res.json({ payment });
  } catch (error) {
    next(error);
  }
};
