import { Router, Request, Response } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import prisma from '../config/database';
import { generateTicketPDF } from '../utils/ticketGenerator';
import { format } from 'date-fns';
import { cs } from 'date-fns/locale';

const router = Router();

/**
 * GET /api/tickets/download/:reservationId
 * Download ticket as PDF with QR code
 */
router.get('/download/:reservationId', authenticate, async (req: Request, res: Response) => {
  try {
    const { reservationId } = req.params;
    const userId = (req as any).user.userId;

    // Find reservation with related data
    const reservation = await prisma.reservation.findUnique({
      where: { id: reservationId },
      include: {
        event: true,
        user: true,
        payment: true,
      },
    });

    if (!reservation) {
      return res.status(404).json({
        status: 'error',
        error: 'Rezervace nebyla nalezena',
      });
    }

    // Check if user owns this reservation
    if (reservation.userId !== userId) {
      return res.status(403).json({
        status: 'error',
        error: 'Nemáte oprávnění ke stažení této vstupenky',
      });
    }

    // Check if reservation is paid
    if (reservation.status !== 'PAID') {
      return res.status(400).json({
        status: 'error',
        error: 'Vstupenku lze stáhnout pouze pro potvrzené rezervace',
      });
    }

    // Format event date
    const eventDate = format(
      new Date(reservation.event.startDate),
      "d. MMMM yyyy 'v' HH:mm",
      { locale: cs }
    );

    // Generate PDF
    const pdfBuffer = await generateTicketPDF({
      reservationCode: reservation.reservationCode,
      eventTitle: reservation.event.title,
      eventDate: eventDate,
      eventLocation: reservation.event.location,
      userName: `${reservation.user.firstName} ${reservation.user.lastName}`,
      userEmail: reservation.user.email,
      ticketCount: reservation.ticketCount,
      totalPrice: Number(reservation.totalAmount),
      paymentStatus: reservation.payment?.status || 'FREE',
    });

    // Set headers for PDF download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="vstupenka-${reservation.reservationCode}.pdf"`
    );
    res.setHeader('Content-Length', pdfBuffer.length);

    // Send PDF
    return res.send(pdfBuffer);
  } catch (error) {
    console.error('Error generating ticket PDF:', error);
    return res.status(500).json({
      status: 'error',
      error: 'Chyba při generování vstupenky',
    });
  }
});

export default router;
