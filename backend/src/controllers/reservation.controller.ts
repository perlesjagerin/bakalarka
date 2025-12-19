import { Response, NextFunction } from 'express';
import { z } from 'zod';
import prisma from '../config/database';
import { AppError } from '../middleware/error.middleware';
import { AuthRequest } from '../middleware/auth.middleware';
import { emailService } from '../utils/emailService';
import { format } from 'date-fns';
import { cs } from 'date-fns/locale';

const createReservationSchema = z.object({
  eventId: z.string().uuid('Neplatné ID akce'),
  ticketCount: z.number().int().positive('Počet vstupenek musí být kladné číslo')
});

// Generate unique reservation code
const generateReservationCode = (): string => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return code;
};

export const createReservation = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      throw new AppError('Uživatel není autentizován', 401);
    }

    const data = createReservationSchema.parse(req.body);

    // Check event availability
    const event = await prisma.event.findUnique({
      where: { id: data.eventId }
    });

    if (!event) {
      throw new AppError('Akce nebyla nalezena', 404);
    }

    if (event.status !== 'PUBLISHED') {
      throw new AppError('Tato akce není dostupná pro rezervaci', 400);
    }

    if (event.availableTickets < data.ticketCount) {
      throw new AppError(
        `Nedostatek volných vstupenek. Dostupné: ${event.availableTickets}`,
        400
      );
    }

    // Calculate total amount
    const totalAmount = Number(event.ticketPrice) * data.ticketCount;
    
    // Pro akce zdarma nastavíme status rovnou na CONFIRMED
    const reservationStatus = totalAmount === 0 ? 'CONFIRMED' : 'PENDING';

    // Create reservation
    const reservation = await prisma.$transaction(async (tx: any) => {
      // Update available tickets
      await tx.event.update({
        where: { id: data.eventId },
        data: {
          availableTickets: {
            decrement: data.ticketCount
          }
        }
      });

      // Create reservation
      const newReservation = await tx.reservation.create({
        data: {
          eventId: data.eventId,
          userId: req.user!.userId,
          ticketCount: data.ticketCount,
          totalAmount,
          reservationCode: generateReservationCode(),
          status: reservationStatus
        },
        include: {
          event: {
            select: {
              id: true,
              title: true,
              startDate: true,
              location: true
            }
          }
        }
      });

      // Pro akce zdarma vytvoříme i payment záznam se statusem COMPLETED
      if (totalAmount === 0) {
        await tx.payment.create({
          data: {
            reservationId: newReservation.id,
            amount: 0,
            status: 'COMPLETED',
            paymentMethod: 'FREE'
          }
        });
        
        console.log(`✅ Vytvořena rezervace zdarma: ${newReservation.id}, status: ${newReservation.status}`);
      }

      return newReservation;
    });

    // Pokud je zdarma, načti znovu s payment pro response
    const finalReservation = totalAmount === 0 
      ? await prisma.reservation.findUnique({
          where: { id: reservation.id },
          include: {
            event: {
              select: {
                id: true,
                title: true,
                startDate: true,
                location: true
              }
            },
            payment: true
          }
        })
      : reservation;

    // Send reservation confirmation email (non-blocking)
    try {
      const user = await prisma.user.findUnique({
        where: { id: req.user!.userId },
        select: { email: true, firstName: true }
      });

      if (user && finalReservation) {
        const eventDate = format(new Date(finalReservation.event.startDate), 'dd. MM. yyyy HH:mm', { locale: cs });
        emailService.sendReservationConfirmation(
          user.email,
          user.firstName,
          finalReservation.event.title,
          finalReservation.reservationCode,
          finalReservation.ticketCount,
          Number(finalReservation.totalAmount),
          eventDate,
          finalReservation.event.location
        ).catch(err => console.error('Failed to send reservation email:', err));
      }
    } catch (emailError) {
      console.error('Error sending reservation email:', emailError);
    }

    res.status(201).json({
      message: 'Rezervace byla úspěšně vytvořena',
      reservation: finalReservation
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return next(new AppError(error.errors[0].message, 400));
    }
    next(error);
  }
};

export const getMyReservations = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      throw new AppError('Uživatel není autentizován', 401);
    }

    const reservations = await prisma.reservation.findMany({
      where: { userId: req.user.userId },
      include: {
        event: true,
        payment: true
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ reservations, count: reservations.length });
  } catch (error) {
    next(error);
  }
};

export const getReservationById = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      throw new AppError('Uživatel není autentizován', 401);
    }

    const { id } = req.params;

    const reservation = await prisma.reservation.findUnique({
      where: { id },
      include: {
        event: true,
        payment: true,
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

    if (!reservation) {
      throw new AppError('Rezervace nebyla nalezena', 404);
    }

    // Check if user owns the reservation or is admin
    if (
      reservation.userId !== req.user.userId &&
      req.user.role !== 'ADMIN'
    ) {
      throw new AppError('Nemáte oprávnění k této rezervaci', 403);
    }

    res.json({ reservation });
  } catch (error) {
    next(error);
  }
};

export const updateReservation = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      throw new AppError('Uživatel není autentizován', 401);
    }

    const { id } = req.params;
    const { ticketCount } = req.body;

    const reservation = await prisma.reservation.findUnique({
      where: { id },
      include: { event: true }
    });

    if (!reservation) {
      throw new AppError('Rezervace nebyla nalezena', 404);
    }

    if (reservation.userId !== req.user.userId) {
      throw new AppError('Nemáte oprávnění upravovat tuto rezervaci', 403);
    }

    if (reservation.status !== 'PENDING') {
      throw new AppError(
        'Lze upravovat pouze rezervace ve stavu PENDING',
        400
      );
    }

    // Calculate ticket difference
    const ticketDiff = ticketCount - reservation.ticketCount;

    if (ticketDiff > 0) {
      // Check availability
      if (reservation.event.availableTickets < ticketDiff) {
        throw new AppError('Nedostatek volných vstupenek', 400);
      }
    }

    // Update reservation
    const updatedReservation = await prisma.$transaction(async (tx: any) => {
      // Update event tickets
      await tx.event.update({
        where: { id: reservation.eventId },
        data: {
          availableTickets: {
            increment: -ticketDiff
          }
        }
      });

      // Update reservation
      const newTotalAmount =
        Number(reservation.event.ticketPrice) * ticketCount;

      return await tx.reservation.update({
        where: { id },
        data: {
          ticketCount,
          totalAmount: newTotalAmount
        },
        include: {
          event: true
        }
      });
    });

    res.json({
      message: 'Rezervace byla úspěšně aktualizována',
      reservation: updatedReservation
    });
  } catch (error) {
    next(error);
  }
};

export const cancelReservation = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      throw new AppError('Uživatel není autentizován', 401);
    }

    const { id } = req.params;

    const reservation = await prisma.reservation.findUnique({
      where: { id },
      include: { 
        payment: true,
        event: {
          select: {
            title: true
          }
        },
        user: {
          select: {
            email: true,
            firstName: true
          }
        }
      }
    });

    if (!reservation) {
      throw new AppError('Rezervace nebyla nalezena', 404);
    }

    if (reservation.userId !== req.user.userId && req.user.role !== 'ADMIN') {
      throw new AppError('Nemáte oprávnění zrušit tuto rezervaci', 403);
    }

    const refundAmount = reservation.payment?.status === 'COMPLETED' ? Number(reservation.totalAmount) : undefined;

    // Update reservation and return tickets
    await prisma.$transaction(async (tx: any) => {
      // Return tickets to event
      await tx.event.update({
        where: { id: reservation.eventId },
        data: {
          availableTickets: {
            increment: reservation.ticketCount
          }
        }
      });

      // Cancel reservation
      await tx.reservation.update({
        where: { id },
        data: { status: 'CANCELLED' }
      });

      // If payment exists and was completed, mark for refund
      if (reservation.payment && reservation.payment.status === 'COMPLETED') {
        await tx.payment.update({
          where: { id: reservation.payment.id },
          data: { status: 'REFUNDED' }
        });
      }
    });

    // Send cancellation email (non-blocking)
    emailService.sendReservationCancellation(
      reservation.user.email,
      reservation.user.firstName,
      reservation.event.title,
      reservation.reservationCode,
      refundAmount
    ).catch(err => console.error('Failed to send cancellation email:', err));

    res.json({ message: 'Rezervace byla úspěšně zrušena' });
  } catch (error) {
    next(error);
  }
};
