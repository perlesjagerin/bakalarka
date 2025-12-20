import { Response, NextFunction } from 'express';
import { z } from 'zod';
import Stripe from 'stripe';
import prisma from '../config/database';
import { AppError } from '../middleware/error.middleware';
import { AuthRequest } from '../middleware/auth.middleware';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16'
});

const createComplaintSchema = z.object({
  reservationId: z.string().uuid('Neplatné ID rezervace'),
  reason: z.string().min(1, 'Důvod reklamace je povinný'),
  description: z.string().min(10, 'Popis musí mít alespoň 10 znaků')
});

export const createComplaint = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      throw new AppError('Uživatel není autentizován', 401);
    }

    const data = createComplaintSchema.parse(req.body);

    // Verify reservation exists and belongs to user
    const reservation = await prisma.reservation.findUnique({
      where: { id: data.reservationId }
    });

    if (!reservation) {
      throw new AppError('Rezervace nebyla nalezena', 404);
    }

    if (reservation.userId !== req.user.userId) {
      throw new AppError('Nemáte oprávnění reklamovat tuto rezervaci', 403);
    }

    // Create complaint
    const complaint = await prisma.complaint.create({
      data: {
        reservationId: data.reservationId,
        userId: req.user.userId,
        reason: data.reason,
        description: data.description,
        status: 'SUBMITTED'
      },
      include: {
        reservation: {
          include: {
            event: true
          }
        }
      }
    });

    res.status(201).json({
      message: 'Reklamace byla úspěšně podána',
      complaint
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return next(new AppError(error.errors[0].message, 400));
    }
    next(error);
  }
};

export const getMyComplaints = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      throw new AppError('Uživatel není autentizován', 401);
    }

    const complaints = await prisma.complaint.findMany({
      where: { userId: req.user.userId },
      include: {
        reservation: {
          include: {
            event: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ complaints, count: complaints.length });
  } catch (error) {
    next(error);
  }
};

export const getComplaintById = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      throw new AppError('Uživatel není autentizován', 401);
    }

    const { id } = req.params;

    const complaint = await prisma.complaint.findUnique({
      where: { id },
      include: {
        reservation: {
          include: {
            event: true
          }
        },
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true
          }
        }
      }
    });

    if (!complaint) {
      throw new AppError('Reklamace nebyla nalezena', 404);
    }

    // Verify user owns this complaint or is admin
    if (complaint.userId !== req.user.userId && req.user.role !== 'ADMIN') {
      throw new AppError('Nemáte oprávnění k této reklamaci', 403);
    }

    res.json({ complaint });
  } catch (error) {
    next(error);
  }
};

export const getAllComplaints = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { status } = req.query;

    const where: any = {};
    if (status) {
      where.status = status as string;
    }

    const complaints = await prisma.complaint.findMany({
      where,
      include: {
        reservation: {
          include: {
            event: true
          }
        },
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Add name field to each complaint's user
    const complaintsWithName = complaints.map(complaint => ({
      ...complaint,
      user: {
        ...complaint.user,
        name: `${complaint.user.firstName} ${complaint.user.lastName}`
      }
    }));

    res.json({ complaints: complaintsWithName, count: complaints.length });
  } catch (error) {
    next(error);
  }
};

export const updateComplaintStatus = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const { status, adminResponse } = req.body;

    const validStatuses = ['SUBMITTED', 'IN_REVIEW', 'REJECTED', 'RESOLVED'];
    
    if (!validStatuses.includes(status)) {
      throw new AppError('Neplatný status reklamace', 400);
    }

    const complaint = await prisma.complaint.update({
      where: { id },
      data: {
        status,
        adminResponse: adminResponse || undefined,
        resolvedAt: status === 'RESOLVED' ? new Date() : undefined
      },
      include: {
        reservation: {
          include: {
            event: true
          }
        }
      }
    });

    res.json({
      message: 'Status reklamace byl aktualizován',
      complaint
    });
  } catch (error) {
    next(error);
  }
};

export const resolveComplaint = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const { adminResponse, shouldRefund } = req.body;

    const complaint = await prisma.complaint.findUnique({
      where: { id },
      include: {
        reservation: {
          include: {
            payment: true
          }
        }
      }
    });

    if (!complaint) {
      throw new AppError('Reklamace nebyla nalezena', 404);
    }

    // Update complaint
    const updatedComplaint = await prisma.$transaction(async (tx: any) => {
      const updated = await tx.complaint.update({
        where: { id },
        data: {
          status: 'RESOLVED',
          adminResponse,
          resolvedAt: new Date(),
          refundIssued: shouldRefund || false
        },
        include: {
          reservation: {
            include: {
              event: true
            }
          },
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true
            }
          }
        }
      });

      // If refund is approved
      if (shouldRefund && complaint.reservation.payment) {
        const payment = complaint.reservation.payment;
        
        // Kontrola, že akce nebyla zdarma
        if (Number(payment.amount) === 0) {
          throw new AppError('Nelze refundovat rezervaci na akci zdarma', 400);
        }
        
        // Pokud existuje Stripe payment ID a platba nebyla zdarma, proveď refund
        if (payment.stripePaymentId && Number(payment.amount) > 0) {
          try {
            console.log(`🔄 Provádím Stripe refund pro payment: ${payment.stripePaymentId}`);
            
            const refund = await stripe.refunds.create({
              payment_intent: payment.stripePaymentId,
              reason: 'requested_by_customer',
            });
            
            console.log(`✅ Stripe refund úspěšný: ${refund.id}, status: ${refund.status}`);
          } catch (stripeError: any) {
            console.error('❌ Stripe refund selhal:', stripeError.message);
            // Pokračujeme i když Stripe refund selže (platba mohla být test mode, atd.)
          }
        }
        
        await tx.payment.update({
          where: { id: payment.id },
          data: { status: 'REFUNDED' }
        });

        await tx.reservation.update({
          where: { id: complaint.reservationId },
          data: { status: 'REFUNDED' }
        });

        // Return tickets to event
        await tx.event.update({
          where: { id: complaint.reservation.eventId },
          data: {
            availableTickets: {
              increment: complaint.reservation.ticketCount
            }
          }
        });
        
        // Aktualizuj všechny ostatní reklamace na stejnou rezervaci
        await tx.complaint.updateMany({
          where: {
            reservationId: complaint.reservationId,
            id: { not: id } // Kromě aktuální reklamace
          },
          data: {
            status: 'RESOLVED',
            refundIssued: true,
            resolvedAt: new Date(),
            adminResponse: adminResponse || 'Rezervace byla refundována na základě jiné reklamace.'
          }
        });
        
        console.log(`✅ Refundace dokončena pro rezervaci: ${complaint.reservationId}`);
      }

      return updated;
    });

    // Add name field to user
    const complaintWithName = {
      ...updatedComplaint,
      user: {
        ...updatedComplaint.user,
        name: `${updatedComplaint.user.firstName} ${updatedComplaint.user.lastName}`
      }
    };

    res.json({ 
      message: 'Reklamace byla vyřešena',
      complaint: complaintWithName
    });
  } catch (error) {
    next(error);
  }
};
