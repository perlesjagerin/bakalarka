import request from 'supertest';
import { PrismaClient } from '@prisma/client';
import app from '../index';

const prisma = new PrismaClient();

describe('Reservations Endpoints', () => {
  let userToken: string;
  let organizerToken: string;
  let testEventId: string;
  let testReservationId: string;

  beforeAll(async () => {
    // Vytvoření testovacích uživatelů
    const userRes = await request(app)
      .post('/api/auth/register')
      .send({
        email: `user.reservations.${Date.now()}@test.com`,
        password: 'TestPass123!',
        firstName: 'Test',
        lastName: 'User',
        role: 'USER'
      });
    userToken = userRes.body.token;

    const organizerRes = await request(app)
      .post('/api/auth/register')
      .send({
        email: `organizer.reservations.${Date.now()}@test.com`,
        password: 'TestPass123!',
        firstName: 'Test',
        lastName: 'Organizer',
        role: 'ORGANIZER'
      });
    organizerToken = organizerRes.body.token;

    // Vytvoření testovacího eventu
    const eventRes = await request(app)
      .post('/api/events')
      .set('Authorization', `Bearer ${organizerToken}`)
      .send({
        title: 'Test Event for Reservations',
        description: 'Test description',
        location: 'Test Location',
        startDate: new Date(Date.now() + 86400000).toISOString(),
        endDate: new Date(Date.now() + 90000000).toISOString(),
        category: 'Hudba',
        totalTickets: 100,
        ticketPrice: 250,
        status: 'PUBLISHED'
      });
    testEventId = eventRes.body.event.id;
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe('POST /api/reservations', () => {
    it('should create a reservation successfully', async () => {
      const res = await request(app)
        .post('/api/reservations')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          eventId: testEventId,
          ticketCount: 2
        });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('reservation');
      expect(res.body.reservation.ticketCount).toBe(2);
      expect(res.body.reservation.eventId).toBe(testEventId);
      expect(res.body.reservation).toHaveProperty('reservationCode');
      
      testReservationId = res.body.reservation.id;
    });

    it('should fail without authentication', async () => {
      const res = await request(app)
        .post('/api/reservations')
        .send({
          eventId: testEventId,
          ticketCount: 2
        });

      expect(res.status).toBe(401);
    });

    it('should fail with invalid eventId', async () => {
      const res = await request(app)
        .post('/api/reservations')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          eventId: 'invalid-id-123',
          ticketCount: 2
        });

      expect(res.status).toBe(400); // Zod validation error pro invalid UUID
    });

    it('should fail with too many tickets', async () => {
      const res = await request(app)
        .post('/api/reservations')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          eventId: testEventId,
          ticketCount: 200
        });

      expect(res.status).toBe(400);
    });
  });

  describe('GET /api/reservations/my', () => {
    it('should get user reservations', async () => {
      const res = await request(app)
        .get('/api/reservations/my')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('reservations');
      expect(Array.isArray(res.body.reservations)).toBe(true);
      expect(res.body.reservations.length).toBeGreaterThan(0);
    });

    it('should fail without authentication', async () => {
      const res = await request(app)
        .delete('/api/reservations/999');

      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/reservations/:id', () => {
    it('should get reservation by id', async () => {
      const res = await request(app)
        .get(`/api/reservations/${testReservationId}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('reservation');
      expect(res.body.reservation.id).toBe(testReservationId);
    });

    it('should return 404 for non-existent reservation', async () => {
      const res = await request(app)
        .get('/api/reservations/non-existent-id-123')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(404);
    });
  });

  describe('DELETE /api/reservations/:id', () => {
    it('should cancel own reservation', async () => {
      // Vytvoříme novou rezervaci k zrušení
      const createRes = await request(app)
        .post('/api/reservations')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          eventId: testEventId,
          ticketCount: 1
        });

      const reservationId = createRes.body.reservation.id;

      const res = await request(app)
        .delete(`/api/reservations/${reservationId}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('message');
    });

    it('should fail without authentication', async () => {
      const res = await request(app)
        .delete(`/api/reservations/${testReservationId}`);

      expect(res.status).toBe(401);
    });
  });

  describe('PUT /api/reservations/:id', () => {
    it('should update reservation ticket count', async () => {
      // Vytvoříme novou rezervaci k úpravě
      const createRes = await request(app)
        .post('/api/reservations')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          eventId: testEventId,
          ticketCount: 2
        });

      const reservationId = createRes.body.reservation.id;

      const res = await request(app)
        .put(`/api/reservations/${reservationId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          ticketCount: 3
        });

      expect(res.status).toBe(200);
      expect(res.body.reservation.ticketCount).toBe(3);
    });

    it('should fail without authentication', async () => {
      const res = await request(app)
        .put(`/api/reservations/${testReservationId}`)
        .send({
          ticketCount: 5
        });

      expect(res.status).toBe(401);
    });
  });
});
