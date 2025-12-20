import Stripe from 'stripe';
import prisma from '../config/database';
import { AppError } from '../middleware/error.middleware';
import { emailService } from '../utils/emailService';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16'
});

interface CreateComplaintData {
  reservationId: string;
  userId: string;
  reason: string;
  description: string;
}

interface ResolveComplaintData {
  complaintId: string;
  adminResponse: string;
  shouldRefund: boolean;
}

interface UpdateComplaintStatusData {
  complaintId: string;
  status: 'SUBMITTED' | 'IN_REVIEW' | 'REJECTED' | 'RESOLVED';
  adminResponse?: string;
}

class ComplaintService {
  /**
   * Create a new complaint
   */
  async createComplaint(data: CreateComplaintData) {
    const { reservationId, userId, reason, description } = data;

    // Verify reservation exists and belongs to user
    const reservation = await prisma.reservation.findUnique({
      where: { id: reservationId }
    });

    if (!reservation) {
      throw new AppError('Rezervace nebyla nalezena', 404);
    }

    if (reservation.userId !== userId) {
      throw new AppError('Nemáte oprávnění reklamovat tuto rezervaci', 403);
    }

    // Create complaint
    const complaint = await prisma.complaint.create({
      data: {
        reservationId,
        userId,
        reason,
        description,
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

    return complaint;
  }

  /**
   * Get user's complaints
   */
  async getUserComplaints(userId: string) {
    return prisma.complaint.findMany({
      where: { userId },
      include: {
        reservation: {
          include: {
            event: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  /**
   * Get complaint by ID
   */
  async getComplaintById(complaintId: string, userId?: string) {
    const complaint = await prisma.complaint.findUnique({
      where: { id: complaintId },
      include: {
        reservation: {
          include: {
            event: true,
            payment: true
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

    // Check ownership if userId provided
    if (userId && complaint.userId !== userId) {
      throw new AppError('Nemáte oprávnění k této reklamaci', 403);
    }

    return complaint;
  }

  /**
   * Get all complaints (admin)
   */
  async getAllComplaints(statusFilter?: string) {
    const where: any = {};
    if (statusFilter) {
      where.status = statusFilter;
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
    return complaints.map(complaint => ({
      ...complaint,
      user: {
        ...complaint.user,
        name: `${complaint.user.firstName} ${complaint.user.lastName}`
      }
    }));
  }

  /**
   * Update complaint status
   */
  async updateComplaintStatus(data: UpdateComplaintStatusData) {
    const { complaintId, status, adminResponse } = data;

    const validStatuses = ['SUBMITTED', 'IN_REVIEW', 'REJECTED', 'RESOLVED'];
    
    if (!validStatuses.includes(status)) {
      throw new AppError('Neplatný status reklamace', 400);
    }

    const complaint = await prisma.complaint.update({
      where: { id: complaintId },
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

    return complaint;
  }

  /**
   * Resolve complaint with optional refund
   */
  async resolveComplaint(data: ResolveComplaintData) {
    const { complaintId, adminResponse, shouldRefund } = data;

    const complaint = await prisma.complaint.findUnique({
      where: { id: complaintId },
      include: {
        reservation: {
          include: {
            payment: true,
            event: true,
            user: {
              select: {
                email: true,
                firstName: true,
                lastName: true
              }
            }
          }
        }
      }
    });

    if (!complaint) {
      throw new AppError('Reklamace nebyla nalezena', 404);
    }

    // If refund is approved and payment exists
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
            reason: 'requested_by_customer'
          });
          
          console.log(`✅ Stripe refund úspěšný: ${refund.id}, status: ${refund.status}`);
        } catch (stripeError: any) {
          console.error('❌ Stripe refund selhal:', stripeError.message);
          // Pokračujeme i když Stripe refund selže (platba mohla být test mode, atd.)
        }
      }
    }

    // Update complaint and reservation in transaction
    const updatedComplaint = await prisma.$transaction(async (tx: any) => {
      // Update complaint status
      const updated = await tx.complaint.update({
        where: { id: complaintId },
        data: {
          status: 'RESOLVED',
          adminResponse,
          refundIssued: shouldRefund,
          resolvedAt: new Date()
        },
        include: {
          reservation: {
            include: {
              event: true,
              payment: true,
              user: {
                select: {
                  email: true,
                  firstName: true,
                  lastName: true
                }
              }
            }
          }
        }
      });

      // If refund is approved, update payment, reservation, and return tickets
      if (shouldRefund && updated.reservation.payment) {
        await tx.payment.update({
          where: { id: updated.reservation.payment.id },
          data: { status: 'REFUNDED' }
        });

        await tx.reservation.update({
          where: { id: updated.reservation.id },
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

        // Update all other complaints for the same reservation
        await tx.complaint.updateMany({
          where: {
            reservationId: complaint.reservationId,
            id: { not: complaintId }
          },
          data: {
            status: 'RESOLVED',
            refundIssued: true,
            resolvedAt: new Date(),
            adminResponse: adminResponse || 'Rezervace byla refundována na základě jiné reklamace.'
          }
        });

        console.log(`✅ Refundace dokončena pro rezervaci: ${updated.reservation.id}`);
      }

      return updated;
    });

    // Send email notification (non-blocking)
    emailService.sendComplaintResponse(
      updatedComplaint.reservation.user.email,
      updatedComplaint.reservation.user.firstName,
      updatedComplaint.reservation.event.title,
      updatedComplaint.status,
      adminResponse,
      shouldRefund && updatedComplaint.reservation.payment 
        ? Number(updatedComplaint.reservation.payment.amount) 
        : undefined
    ).catch(error => {
      console.error('Failed to send complaint response email:', error);
    });

    return updatedComplaint;
  }
}

export const complaintService = new ComplaintService();
