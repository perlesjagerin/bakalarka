import request from 'supertest';
import { PrismaClient } from '@prisma/client';
import app from '../index';
import { emailService } from '../utils/emailService';

const prisma = new PrismaClient();

// Mock emailService to avoid sending real emails during tests
jest.mock('../utils/emailService', () => ({
  emailService: {
    sendWelcomeEmail: jest.fn().mockResolvedValue(true),
    sendReservationConfirmation: jest.fn().mockResolvedValue(true),
    sendPaymentConfirmation: jest.fn().mockResolvedValue(true),
    sendReservationCancellation: jest.fn().mockResolvedValue(true),
    sendEventStatusChange: jest.fn().mockResolvedValue(true),
    sendComplaintResponse: jest.fn().mockResolvedValue(true),
  },
}));

describe('Email Notifications Integration Tests', () => {
  let authToken: string;
  let organizerToken: string;
  let eventId: string;
  let reservationId: string;

  const testUser = {
    email: `emailtest.${Date.now()}@example.com`,
    password: 'TestPassword123!',
    firstName: 'Email',
    lastName: 'TestUser',
    role: 'USER' as const,
  };

  const testOrganizer = {
    email: `organizer.${Date.now()}@example.com`,
    password: 'OrganizerPass123!',
    firstName: 'Event',
    lastName: 'Organizer',
    role: 'ORGANIZER' as const,
  };

  beforeAll(async () => {
    // Clear mocks before setup
    jest.clearAllMocks();

    // Register test user
    const userRes = await request(app)
      .post('/api/auth/register')
      .send(testUser);
    
    authToken = userRes.body.token;

    // Register test organizer
    const orgRes = await request(app)
      .post('/api/auth/register')
      .send(testOrganizer);
    
    organizerToken = orgRes.body.token;

    // Create test event
    const eventRes = await request(app)
      .post('/api/events')
      .set('Authorization', `Bearer ${organizerToken}`)
      .send({
        title: 'Email Test Event',
        description: 'Event for testing email notifications',
        location: 'Test Location',
        startDate: new Date(Date.now() + 86400000).toISOString(),
        endDate: new Date(Date.now() + 90000000).toISOString(),
        category: 'CONFERENCE',
        totalTickets: 100,
        ticketPrice: 0, // Free event for easier testing
        imageUrl: '',
      });

    if (!eventRes.body || !eventRes.body.event) {
      throw new Error(`Failed to create event: ${JSON.stringify(eventRes.body)}`);
    }

    eventId = eventRes.body.event.id;

    // Publish the event
    await request(app)
      .patch(`/api/events/${eventId}`)
      .set('Authorization', `Bearer ${organizerToken}`)
      .send({ status: 'PUBLISHED' });

    // Clear mocks after setup
    jest.clearAllMocks();
  });

  afterAll(async () => {
    // Cleanup - delete in correct order for foreign keys
    if (reservationId) {
      await prisma.payment.deleteMany({
        where: { reservationId }
      });
      await prisma.reservation.deleteMany({
        where: { id: reservationId }
      });
    }
    
    if (eventId) {
      await prisma.payment.deleteMany({
        where: { reservation: { eventId } }
      });
      await prisma.reservation.deleteMany({
        where: { eventId }
      });
      await prisma.event.deleteMany({
        where: { id: eventId }
      });
    }

    await prisma.user.deleteMany({
      where: {
        email: {
          in: [testUser.email, testOrganizer.email]
        }
      }
    });

    await prisma.$disconnect();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Registration Email', () => {
    it('should send welcome email after successful registration', async () => {
      const newUser = {
        email: `newuser.${Date.now()}@example.com`,
        password: 'NewUserPass123!',
        firstName: 'New',
        lastName: 'User',
        role: 'USER' as const,
      };

      const res = await request(app)
        .post('/api/auth/register')
        .send(newUser);

      expect(res.status).toBe(201);
      
      // Verify welcome email was called
      expect(emailService.sendWelcomeEmail).toHaveBeenCalledWith(
        newUser.email,
        newUser.firstName
      );

      // Cleanup
      await prisma.user.deleteMany({
        where: { email: newUser.email }
      });
    });

    it('should not fail registration if email sending fails', async () => {
      // Mock email service to fail
      (emailService.sendWelcomeEmail as jest.Mock).mockRejectedValueOnce(
        new Error('Email service error')
      );

      const newUser = {
        email: `failuser.${Date.now()}@example.com`,
        password: 'FailUser123!',
        firstName: 'Fail',
        lastName: 'User',
        role: 'USER' as const,
      };

      const res = await request(app)
        .post('/api/auth/register')
        .send(newUser);

      // Registration should still succeed even if email fails
      expect(res.status).toBe(201);
      expect(res.body.user).toBeDefined();

      // Cleanup
      await prisma.user.deleteMany({
        where: { email: newUser.email }
      });
    });
  });

  describe('Reservation Confirmation Email', () => {
    it('should send confirmation email after creating reservation', async () => {
      const res = await request(app)
        .post('/api/reservations')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          eventId: eventId,
          ticketCount: 2,
        });

      expect(res.status).toBe(201);
      reservationId = res.body.reservation.id;

      // Verify confirmation email was called
      expect(emailService.sendReservationConfirmation).toHaveBeenCalled();
      
      const callArgs = (emailService.sendReservationConfirmation as jest.Mock).mock.calls[0];
      expect(callArgs[0]).toBe(testUser.email);
      expect(callArgs[1]).toBe(testUser.firstName);
      expect(callArgs[2]).toBe('Email Test Event');
      expect(callArgs[3]).toBeDefined(); // reservation code
      expect(callArgs[4]).toBe(2); // ticket count
    });

    it('should include correct reservation details in email', async () => {
      const res = await request(app)
        .post('/api/reservations')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          eventId: eventId,
          ticketCount: 3,
        });

      expect(res.status).toBe(201);

      const callArgs = (emailService.sendReservationConfirmation as jest.Mock).mock.calls[0];
      expect(callArgs[4]).toBe(3); // ticket count
      expect(callArgs[5]).toBe(0); // total amount (free event)
      expect(callArgs[7]).toBe('Test Location'); // event location

      // Cleanup
      await prisma.payment.deleteMany({
        where: { reservationId: res.body.reservation.id }
      });
      await prisma.reservation.deleteMany({
        where: { id: res.body.reservation.id }
      });
    });

    it('should not fail reservation if email sending fails', async () => {
      (emailService.sendReservationConfirmation as jest.Mock).mockRejectedValueOnce(
        new Error('Email error')
      );

      const res = await request(app)
        .post('/api/reservations')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          eventId: eventId,
          ticketCount: 1,
        });

      expect(res.status).toBe(201);
      expect(res.body.reservation).toBeDefined();

      // Cleanup
      await prisma.payment.deleteMany({
        where: { reservationId: res.body.reservation.id }
      });
      await prisma.reservation.deleteMany({
        where: { id: res.body.reservation.id }
      });
    });
  });

  describe('Reservation Cancellation Email', () => {
    let cancelReservationId: string;

    beforeEach(async () => {
      // Create a reservation to cancel
      const res = await request(app)
        .post('/api/reservations')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          eventId: eventId,
          ticketCount: 1,
        });

      cancelReservationId = res.body.reservation.id;
      jest.clearAllMocks(); // Clear the confirmation email call
    });

    afterEach(async () => {
      if (cancelReservationId) {
        await prisma.payment.deleteMany({
          where: { reservationId: cancelReservationId }
        }).catch(() => {});
        await prisma.reservation.deleteMany({
          where: { id: cancelReservationId }
        }).catch(() => {}); // May already be deleted
      }
    });

    it('should send cancellation email when reservation is cancelled', async () => {
      const res = await request(app)
        .delete(`/api/reservations/${cancelReservationId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);

      // Verify cancellation email was called
      expect(emailService.sendReservationCancellation).toHaveBeenCalled();
      
      const callArgs = (emailService.sendReservationCancellation as jest.Mock).mock.calls[0];
      expect(callArgs[0]).toBe(testUser.email);
      expect(callArgs[1]).toBe(testUser.firstName);
      expect(callArgs[2]).toBe('Email Test Event');
      expect(callArgs[3]).toBeDefined(); // reservation code
    });

    it('should not fail cancellation if email sending fails', async () => {
      (emailService.sendReservationCancellation as jest.Mock).mockRejectedValueOnce(
        new Error('Email error')
      );

      const res = await request(app)
        .delete(`/api/reservations/${cancelReservationId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.message).toContain('zrušena');
    });
  });

  describe('Email Sending Robustness', () => {
    it('should handle multiple concurrent email sends', async () => {
      const promises = Array.from({ length: 5 }, () => 
        request(app)
          .post('/api/reservations')
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            eventId: eventId,
            ticketCount: 1,
          })
      );

      const results = await Promise.all(promises);

      results.forEach(res => {
        expect(res.status).toBe(201);
      });

      // Verify email was called for each reservation (2x per reservation: user + organizer)
      expect(emailService.sendReservationConfirmation).toHaveBeenCalledTimes(10);

      // Cleanup
      const reservationIds = results.map(r => r.body.reservation.id);
      await prisma.payment.deleteMany({
        where: { reservationId: { in: reservationIds } }
      });
      await prisma.reservation.deleteMany({
        where: { id: { in: reservationIds } }
      });
    });

    it('should recover from temporary email service failures', async () => {
      // First call fails
      (emailService.sendWelcomeEmail as jest.Mock)
        .mockRejectedValueOnce(new Error('Temporary failure'))
        .mockResolvedValue(true);

      // First registration
      const user1 = {
        email: `temp1.${Date.now()}@example.com`,
        password: 'Pass123!',
        firstName: 'Temp1',
        lastName: 'User',
        role: 'USER' as const,
      };

      const res1 = await request(app)
        .post('/api/auth/register')
        .send(user1);

      expect(res1.status).toBe(201);

      // Second registration should work
      const user2 = {
        email: `temp2.${Date.now()}@example.com`,
        password: 'Pass123!',
        firstName: 'Temp2',
        lastName: 'User',
        role: 'USER' as const,
      };

      const res2 = await request(app)
        .post('/api/auth/register')
        .send(user2);

      expect(res2.status).toBe(201);

      // Cleanup
      await prisma.user.deleteMany({
        where: {
          email: { in: [user1.email, user2.email] }
        }
      });
    });
  });

  describe('Email Content Validation', () => {
    it('should send emails with correct user data', async () => {
      const specificUser = {
        email: `specific.${Date.now()}@example.com`,
        password: 'SpecificPass123!',
        firstName: 'Specific',
        lastName: 'TestUser',
        role: 'USER' as const,
      };

      await request(app)
        .post('/api/auth/register')
        .send(specificUser);

      const callArgs = (emailService.sendWelcomeEmail as jest.Mock).mock.calls[0];
      expect(callArgs[0]).toBe(specificUser.email);
      expect(callArgs[1]).toBe(specificUser.firstName);

      // Cleanup
      await prisma.user.deleteMany({
        where: { email: specificUser.email }
      });
    });

    it('should send reservation emails with event details', async () => {
      const res = await request(app)
        .post('/api/reservations')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          eventId: eventId,
          ticketCount: 2,
        });

      expect(res.status).toBe(201);

      const callArgs = (emailService.sendReservationConfirmation as jest.Mock).mock.calls[0];
      
      // Verify all required fields are present
      expect(callArgs[0]).toBeTruthy(); // email
      expect(callArgs[1]).toBeTruthy(); // firstName
      expect(callArgs[2]).toBeTruthy(); // eventTitle
      expect(callArgs[3]).toBeTruthy(); // reservationCode
      expect(callArgs[4]).toBe(2); // ticketCount
      expect(typeof callArgs[5]).toBe('number'); // totalAmount
      expect(callArgs[6]).toBeTruthy(); // eventDate
      expect(callArgs[7]).toBeTruthy(); // eventLocation

      // Cleanup
      await prisma.payment.deleteMany({
        where: { reservationId: res.body.reservation.id }
      });
      await prisma.reservation.deleteMany({
        where: { id: res.body.reservation.id }
      });
    });
  });
});
