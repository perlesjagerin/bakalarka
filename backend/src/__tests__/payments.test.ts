import request from 'supertest';
import { PrismaClient } from '@prisma/client';
import app from '../index';

const prisma = new PrismaClient();

describe('Payment Endpoints', () => {
  let userToken: string;
  let testEventId: string;
  let testReservationId: string;
  let testPaymentId: string;

  beforeAll(async () => {
    // Vytvoření běžného uživatele
    const userRes = await request(app)
      .post('/api/auth/register')
      .send({
        email: `user.payments.${Date.now()}@test.com`,
        password: 'TestPass123!',
        firstName: 'Test',
        lastName: 'User',
        role: 'USER'
      });
    userToken = userRes.body.token;

    // Vytvoření organizátora pro akci
    const organizerRes = await request(app)
      .post('/api/auth/register')
      .send({
        email: `organizer.payments.${Date.now()}@test.com`,
        password: 'OrganizerPass123!',
        firstName: 'Test',
        lastName: 'Organizer',
        role: 'ORGANIZER'
      });
    const organizerToken = organizerRes.body.token;

    // Vytvoření testovací akce s cenou
    const eventRes = await request(app)
      .post('/api/events')
      .set('Authorization', `Bearer ${organizerToken}`)
      .send({
        title: 'Test Event for Payments',
        description: 'Description',
        location: 'Test Location',
        startDate: new Date(Date.now() + 86400000).toISOString(),
        endDate: new Date(Date.now() + 90000000).toISOString(),
        category: 'Hudba',
        totalTickets: 100,
        ticketPrice: 500,
        status: 'PUBLISHED'
      });
    testEventId = eventRes.body.event.id;

    // Vytvoření rezervace (což vytvoří pending payment)
    const reservationRes = await request(app)
      .post('/api/reservations')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        eventId: testEventId,
        ticketCount: 2
      });
    testReservationId = reservationRes.body.reservation.id;

    // Vytvoření payment intent pro testování GET endpointu
    await request(app)
      .post('/api/payments/create-payment-intent')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        reservationId: testReservationId
      });
    
    // Získání paymentId z databáze
    const payment = await prisma.payment.findFirst({
      where: { reservationId: testReservationId }
    });
    if (payment) {
      testPaymentId = payment.id;
    }
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe('POST /api/payments/create-payment-intent', () => {
    it('should create payment intent', async () => {
      const res = await request(app)
        .post('/api/payments/create-payment-intent')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          reservationId: testReservationId
        });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('clientSecret');
    });

    it('should fail without authentication', async () => {
      const res = await request(app)
        .post('/api/payments/create-payment-intent')
        .send({
          reservationId: testReservationId
        });

      expect(res.status).toBe(401);
    });

    it('should fail with invalid reservation', async () => {
      const res = await request(app)
        .post('/api/payments/create-payment-intent')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          reservationId: '00000000-0000-0000-0000-000000000000'
        });

      expect(res.status).toBe(404);
    });

    it('should fail for free event (zero amount)', async () => {
      // Vytvoření bezplatné akce
      const organizerRes = await request(app)
        .post('/api/auth/register')
        .send({
          email: `organizer.free.${Date.now()}@test.com`,
          password: 'OrganizerPass123!',
          firstName: 'Free',
          lastName: 'Organizer',
          role: 'ORGANIZER'
        });
      const organizerToken = organizerRes.body.token;

      const freeEventRes = await request(app)
        .post('/api/events')
        .set('Authorization', `Bearer ${organizerToken}`)
        .send({
          title: 'Free Event',
          description: 'Description',
          location: 'Test Location',
          startDate: new Date(Date.now() + 86400000).toISOString(),
          endDate: new Date(Date.now() + 90000000).toISOString(),
          category: 'Hudba',
          totalTickets: 100,
          ticketPrice: 0,
          status: 'PUBLISHED'
        });

      const freeReservationRes = await request(app)
        .post('/api/reservations')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          eventId: freeEventRes.body.event.id,
          ticketCount: 1
        });

      const res = await request(app)
        .post('/api/payments/create-payment-intent')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          reservationId: freeReservationRes.body.reservation.id
        });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('error');
      if (res.body.error) {
        expect(res.body.error).toContain('zdarma');
      }
    });

    it('should fail for already confirmed reservation', async () => {
      // Update reservation status to CONFIRMED
      await prisma.reservation.update({
        where: { id: testReservationId },
        data: { status: 'CONFIRMED' }
      });

      const res = await request(app)
        .post('/api/payments/create-payment-intent')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          reservationId: testReservationId
        });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('error');
      if (res.body.error) {
        expect(res.body.error).toContain('nelze zaplatit');
      }

      // Reset status back to PENDING for other tests
      await prisma.reservation.update({
        where: { id: testReservationId },
        data: { status: 'PENDING' }
      });
    });
  });

  describe('GET /api/payments/:paymentId/status', () => {
    it('should get payment status', async () => {
      const res = await request(app)
        .get(`/api/payments/${testPaymentId}/status`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('payment');
      expect(res.body.payment.id).toBe(testPaymentId);
    });

    it('should fail without authentication', async () => {
      const res = await request(app)
        .get(`/api/payments/${testPaymentId}/status`);

      expect(res.status).toBe(401);
    });
  });

  describe('POST /api/payments/webhook', () => {
    it('should handle webhook (basic test)', async () => {
      // Mock console.error to suppress expected error output in test
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      
      // Poznámka: Plné testování Stripe webhook vyžaduje mock Stripe signature
      const res = await request(app)
        .post('/api/payments/webhook')
        .set('stripe-signature', 'test-signature')
        .send({
          type: 'payment_intent.succeeded'
        });

      // Očekáváme chybu protože nemáme validní Stripe signature nebo tělo
      expect([400, 401, 403, 500]).toContain(res.status);
      
      // Restore console.error
      consoleErrorSpy.mockRestore();
    });
  });
});
