import prisma from '../config/database';
import { AppError } from '../middleware/error.middleware';
import { emailService } from '../utils/emailService';
import { format } from 'date-fns';
import { cs } from 'date-fns/locale';

interface CreateReservationData {
  eventId: string;
  userId: string;
  ticketCount: number;
}

interface CancelReservationData {
  reservationId: string;
  userId: string;
  isAdmin?: boolean;
}

interface UpdateReservationData {
  reservationId: string;
  userId: string;
  ticketCount: number;
}

class ReservationService {
  /**
   * Generate unique reservation code
   */
  private generateReservationCode(): string {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 8; i++) {
      code += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return code;
  }

  /**
   * Validate event availability for reservation
   */
  private async validateEventAvailability(eventId: string, ticketCount: number) {
    const event = await prisma.event.findUnique({
      where: { id: eventId }
    });

    if (!event) {
      throw new AppError('Akce nebyla nalezena', 404);
    }

    if (event.status !== 'PUBLISHED') {
      throw new AppError('Tato akce není dostupná pro rezervaci', 400);
    }

    if (event.availableTickets < ticketCount) {
      throw new AppError(
        `Nedostatek volných vstupenek. Dostupné: ${event.availableTickets}`,
        400
      );
    }

    return event;
  }

  /**
   * Create a new reservation
   */
  async createReservation(data: CreateReservationData) {
    const { eventId, userId, ticketCount } = data;

    // Validate event availability
    const event = await this.validateEventAvailability(eventId, ticketCount);

    // Calculate total amount
    const totalAmount = Number(event.ticketPrice) * ticketCount;
    
    // Pro akce zdarma nastavíme status rovnou na PAID
    const reservationStatus = totalAmount === 0 ? 'PAID' : 'PENDING';

    // Create reservation in transaction
    const reservation = await prisma.$transaction(async (tx: any) => {
      // Update available tickets
      await tx.event.update({
        where: { id: eventId },
        data: {
          availableTickets: {
            decrement: ticketCount
          }
        }
      });

      // Create reservation
      const newReservation = await tx.reservation.create({
        data: {
          eventId,
          userId,
          ticketCount,
          totalAmount,
          status: reservationStatus,
          reservationCode: this.generateReservationCode()
        },
        include: {
          event: {
            include: {
              organizer: {
                select: {
                  firstName: true,
                  lastName: true,
                  email: true
                }
              }
            }
          },
          user: {
            select: {
              firstName: true,
              lastName: true,
              email: true
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
      }

      return newReservation;
    });

    console.log(`✅ Vytvořena rezervace ${totalAmount === 0 ? 'zdarma' : ''}: ${reservation.id}, status: ${reservation.status}`);

    // Send confirmation emails (non-blocking)
    this.sendReservationConfirmationEmails(reservation).catch(error => {
      console.error('Failed to send reservation confirmation emails:', error);
    });

    return reservation;
  }

  /**
   * Get user's reservations
   */
  async getUserReservations(userId: string) {
    return prisma.reservation.findMany({
      where: { userId },
      include: {
        event: {
          select: {
            id: true,
            title: true,
            location: true,
            startDate: true,
            endDate: true,
            ticketPrice: true,
            category: true,
            status: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
  }

  /**
   * Get reservation by ID
   */
  async getReservationById(reservationId: string, userId?: string) {
    const reservation = await prisma.reservation.findUnique({
      where: { id: reservationId },
      include: {
        event: {
          select: {
            id: true,
            title: true,
            location: true,
            startDate: true,
            endDate: true,
            ticketPrice: true,
            category: true,
            status: true,
            organizerId: true
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

    if (!reservation) {
      throw new AppError('Rezervace nebyla nalezena', 404);
    }

    // Check ownership if userId provided
    if (userId && reservation.userId !== userId) {
      throw new AppError('Nemáte oprávnění k této rezervaci', 403);
    }

    return reservation;
  }

  /**
   * Cancel reservation
   */
  async cancelReservation(data: CancelReservationData) {
    const { reservationId, userId, isAdmin } = data;

    const reservation = await prisma.reservation.findUnique({
      where: { id: reservationId },
      include: {
        event: true,
        user: {
          select: {
            email: true,
            firstName: true,
            lastName: true
          }
        },
        payment: true
      }
    });

    if (!reservation) {
      throw new AppError('Rezervace nebyla nalezena', 404);
    }

    // Check authorization
    if (!isAdmin && reservation.userId !== userId) {
      throw new AppError('Nemáte oprávnění zrušit tuto rezervaci', 403);
    }

    // Check if reservation can be cancelled
    if (reservation.status === 'CANCELLED') {
      throw new AppError('Rezervace je již zrušena', 400);
    }

    if (reservation.status === 'REFUNDED') {
      throw new AppError('Nelze zrušit refundovanou rezervaci', 400);
    }

    // Check if event has already passed
    if (new Date() > new Date(reservation.event.endDate)) {
      throw new AppError('Nelze zrušit rezervaci na událost, která již proběhla', 400);
    }

    // Process refund if paid
    let refundAmount = 0;
    const shouldRefund = (reservation.status === 'PAID' as any) && Number(reservation.totalAmount) > 0;

    if (shouldRefund && reservation.payment && reservation.payment.stripePaymentId) {
      try {
        await this.processRefund(reservation.payment.stripePaymentId, Number(reservation.totalAmount));
        refundAmount = Number(reservation.totalAmount);
      } catch (error) {
        console.error('Chyba při refundaci:', error);
        throw new AppError('Chyba při zpracování refundace', 500);
      }
    }

    // Update reservation and restore tickets
    const cancelledReservation = await prisma.$transaction(async (tx: any) => {
      // Update reservation
      const updated = await tx.reservation.update({
        where: { id: reservationId },
        data: {
          status: shouldRefund ? 'REFUNDED' : 'CANCELLED'
        },
        include: {
          event: true,
          user: {
            select: {
              email: true,
              firstName: true,
              lastName: true
            }
          }
        }
      });

      // Restore tickets
      await tx.event.update({
        where: { id: reservation.eventId },
        data: {
          availableTickets: {
            increment: reservation.ticketCount
          }
        }
      });

      return updated;
    });

    // Send cancellation email (non-blocking)
    emailService.sendReservationCancellation(
      cancelledReservation.user.email,
      cancelledReservation.user.firstName,
      cancelledReservation.event.title,
      cancelledReservation.reservationCode,
      shouldRefund ? refundAmount : undefined
    ).catch(error => {
      console.error('Failed to send cancellation email:', error);
    });

    return cancelledReservation;
  }

  /**
   * Get all reservations (admin)
   */
  async getAllReservations() {
    return prisma.reservation.findMany({
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true
          }
        },
        event: {
          select: {
            id: true,
            title: true,
            startDate: true,
            ticketPrice: true,
            category: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
  }

  /**
   * Update reservation ticket count
   */
  async updateReservation(data: UpdateReservationData) {
    const { reservationId, userId, ticketCount } = data;

    const reservation = await prisma.reservation.findUnique({
      where: { id: reservationId },
      include: { event: true }
    });

    if (!reservation) {
      throw new AppError('Rezervace nebyla nalezena', 404);
    }

    if (reservation.userId !== userId) {
      throw new AppError('Nemáte oprávnění upravovat tuto rezervaci', 403);
    }

    if (reservation.status !== 'PENDING') {
      throw new AppError('Lze upravovat pouze rezervace ve stavu PENDING', 400);
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
      const newTotalAmount = Number(reservation.event.ticketPrice) * ticketCount;

      return await tx.reservation.update({
        where: { id: reservationId },
        data: {
          ticketCount,
          totalAmount: newTotalAmount
        },
        include: {
          event: true
        }
      });
    });

    return updatedReservation;
  }

  /**
   * Send reservation confirmation emails
   */
  private async sendReservationConfirmationEmails(reservation: any) {
    const formattedDate = format(new Date(reservation.event.startDate), "d. MMMM yyyy 'v' HH:mm", { locale: cs });

    // Email uživateli
    await emailService.sendReservationConfirmation(
      reservation.user.email,
      reservation.user.firstName,
      reservation.event.title,
      reservation.reservationCode,
      reservation.ticketCount,
      Number(reservation.totalAmount),
      formattedDate,
      reservation.event.location
    );

    // Email organizátorovi
    await emailService.sendReservationConfirmation(
      reservation.event.organizer.email,
      reservation.event.organizer.firstName,
      reservation.event.title,
      reservation.reservationCode,
      reservation.ticketCount,
      Number(reservation.totalAmount),
      formattedDate,
      reservation.event.location
    );
  }

  /**
   * Process Stripe refund
   */
  private async processRefund(stripePaymentId: string, amount: number): Promise<void> {
    const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
    
    const paymentIntent = await stripe.paymentIntents.retrieve(stripePaymentId);
    
    if (paymentIntent.status === 'succeeded') {
      await stripe.refunds.create({
        payment_intent: stripePaymentId,
        amount: Math.round(amount * 100)
      });
    }
  }
}

export const reservationService = new ReservationService();
