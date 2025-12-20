import request from 'supertest';
import express from 'express';
import ticketRoutes from '../routes/ticket.routes';
import prisma from '../config/database';
import jwt from 'jsonwebtoken';
import { generateTicketPDF } from '../utils/ticketGenerator';

// Mock ticketGenerator
jest.mock('../utils/ticketGenerator');
const mockGenerateTicketPDF = generateTicketPDF as jest.MockedFunction<typeof generateTicketPDF>;

const app = express();
app.use(express.json());
app.use('/api/tickets', ticketRoutes);

describe('Ticket Download Endpoints', () => {
  let userToken: string;
  let userId: string;
  let organizerId: string;
  let eventId: string;
  let confirmedReservationId: string;
  let pendingReservationId: string;
  
  beforeAll(async () => {
    // Create test user
    const user = await prisma.user.create({
      data: {
        email: `ticket.user.${Date.now()}@test.com`,
        password: 'hashedPassword',
        firstName: 'Test',
        lastName: 'User',
        role: 'USER',
      },
    });
    userId = user.id;
    
    // Create organizer
    const organizer = await prisma.user.create({
      data: {
        email: `ticket.organizer.${Date.now()}@test.com`,
        password: 'hashedPassword',
        firstName: 'Organizer',
        lastName: 'Test',
        role: 'ORGANIZER',
      },
    });
    organizerId = organizer.id;
    
    // Create event
    const event = await prisma.event.create({
      data: {
        title: 'Test Event for Tickets',
        description: 'Event description',
        location: 'Test Location',
        startDate: new Date('2025-12-31'),
        endDate: new Date('2026-01-01'),
        category: 'MUSIC',
        totalTickets: 100,
        availableTickets: 90,
        ticketPrice: 500,
        status: 'PUBLISHED',
        organizerId,
      },
    });
    eventId = event.id;
    
    // Create paid reservation with payment
    const paidReservation = await prisma.reservation.create({
      data: {
        eventId,
        userId,
        ticketCount: 2,
        totalAmount: 1000,
        status: 'PAID' as any,
        reservationCode: 'TEST-PAID-001',
      },
    });
    confirmedReservationId = paidReservation.id;
    
    await prisma.payment.create({
      data: {
        reservationId: confirmedReservationId,
        amount: 1000,
        status: 'COMPLETED',
        stripePaymentId: 'pi_test_123',
      },
    });
    
    // Create pending reservation
    const pendingReservation = await prisma.reservation.create({
      data: {
        eventId,
        userId,
        ticketCount: 1,
        totalAmount: 500,
        status: 'PENDING',
        reservationCode: 'TEST-PENDING-001',
      },
    });
    pendingReservationId = pendingReservation.id;
    
    // Generate token
    userToken = jwt.sign(
      { userId: user.id, email: user.email, role: 'USER' },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    );
  });
  
  beforeEach(() => {
    // Reset mock
    mockGenerateTicketPDF.mockReset();
  });

  describe('GET /api/tickets/download/:reservationId', () => {
    it('should download ticket PDF for paid reservation', async () => {
      const mockPdfBuffer = Buffer.from('mock-pdf-content');
      mockGenerateTicketPDF.mockResolvedValue(mockPdfBuffer);
      
      const response = await request(app)
        .get(`/api/tickets/download/${confirmedReservationId}`)
        .set('Authorization', `Bearer ${userToken}`);
      
      expect(response.status).toBe(200);
      expect(response.headers['content-type']).toBe('application/pdf');
      expect(response.headers['content-disposition']).toContain('attachment');
      expect(response.headers['content-disposition']).toContain('TEST-PAID-001');
      expect(response.body).toEqual(mockPdfBuffer);
      
      expect(mockGenerateTicketPDF).toHaveBeenCalledWith({
        reservationCode: 'TEST-PAID-001',
        eventTitle: 'Test Event for Tickets',
        eventDate: expect.any(String),
        eventLocation: 'Test Location',
        userName: 'Test User',
        userEmail: expect.stringContaining('@test.com'),
        ticketCount: 2,
        totalPrice: 1000,
        paymentStatus: 'COMPLETED',
      });
    });
    
    it('should fail without authentication', async () => {
      const response = await request(app)
        .get(`/api/tickets/download/${confirmedReservationId}`);
      
      expect(response.status).toBe(401);
    });
    
    it('should fail for non-existent reservation', async () => {
      const response = await request(app)
        .get('/api/tickets/download/non-existent-id')
        .set('Authorization', `Bearer ${userToken}`);
      
      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Rezervace nebyla nalezena');
    });
    
    it('should fail for reservation not owned by user', async () => {
      // Create another user and their reservation
      const otherUser = await prisma.user.create({
        data: {
          email: `ticket.other.${Date.now()}@test.com`,
          password: 'hashedPassword',
          firstName: 'Other',
          lastName: 'User',
          role: 'USER',
        },
      });
      
      const otherReservation = await prisma.reservation.create({
        data: {
          eventId,
          userId: otherUser.id,
          ticketCount: 1,
          totalAmount: 500,
          status: 'PAID' as any,
          reservationCode: 'TEST-OTHER-001',
        },
      });
      
      const response = await request(app)
        .get(`/api/tickets/download/${otherReservation.id}`)
        .set('Authorization', `Bearer ${userToken}`);
      
      expect(response.status).toBe(403);
      expect(response.body.error).toBe('Nemáte oprávnění ke stažení této vstupenky');
    });
    
    it('should fail for pending reservation', async () => {
      const response = await request(app)
        .get(`/api/tickets/download/${pendingReservationId}`)
        .set('Authorization', `Bearer ${userToken}`);
      
      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Vstupenku lze stáhnout pouze pro potvrzené rezervace');
    });
    
    it('should handle PDF generation error', async () => {
      mockGenerateTicketPDF.mockRejectedValue(new Error('PDF generation failed'));
      
      const response = await request(app)
        .get(`/api/tickets/download/${confirmedReservationId}`)
        .set('Authorization', `Bearer ${userToken}`);
      
      expect(response.status).toBe(500);
      expect(response.body.error).toBe('Chyba při generování vstupenky');
    });
    
    it('should download ticket for free event', async () => {
      // Create free event
      const freeEvent = await prisma.event.create({
        data: {
          title: 'Free Event',
          description: 'Free event description',
          location: 'Free Location',
          startDate: new Date('2025-12-31'),
          endDate: new Date('2026-01-01'),
          category: 'OTHER',
          totalTickets: 50,
          availableTickets: 45,
          ticketPrice: 0,
          status: 'PUBLISHED',
          organizerId,
        },
      });
      
      const freeReservation = await prisma.reservation.create({
        data: {
          eventId: freeEvent.id,
          userId,
          ticketCount: 1,
          totalAmount: 0,
          status: 'PAID' as any,
          reservationCode: 'TEST-FREE-001',
        },
      });
      
      const mockPdfBuffer = Buffer.from('mock-pdf-free');
      mockGenerateTicketPDF.mockResolvedValue(mockPdfBuffer);
      
      const response = await request(app)
        .get(`/api/tickets/download/${freeReservation.id}`)
        .set('Authorization', `Bearer ${userToken}`);
      
      expect(response.status).toBe(200);
      expect(mockGenerateTicketPDF).toHaveBeenCalledWith(
        expect.objectContaining({
          totalPrice: 0,
          paymentStatus: 'FREE',
        })
      );
    });
  });
});
