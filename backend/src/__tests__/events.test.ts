import request from 'supertest';
import { PrismaClient } from '@prisma/client';
import app from '../index';

const prisma = new PrismaClient();

describe('Events Endpoints', () => {
  let userToken: string;
  let organizerToken: string;
  let testEventId: string;

  beforeAll(async () => {
    // Vytvoření testovacích uživatelů
    const userRes = await request(app)
      .post('/api/auth/register')
      .send({
        email: `user.events.${Date.now()}@test.com`,
        password: 'TestPass123!',
        firstName: 'Test',
        lastName: 'User',
        role: 'USER'
      });
    userToken = userRes.body.token;

    const organizerRes = await request(app)
      .post('/api/auth/register')
      .send({
        email: `organizer.events.${Date.now()}@test.com`,
        password: 'TestPass123!',
        firstName: 'Test',
        lastName: 'Organizer',
        role: 'ORGANIZER'
      });
    organizerToken = organizerRes.body.token;
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe('GET /api/events', () => {
    it('should get all published events without authentication', async () => {
      const res = await request(app)
        .get('/api/events');

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('events');
      expect(Array.isArray(res.body.events)).toBe(true);
    });

    it('should filter events by category', async () => {
      const res = await request(app)
        .get('/api/events?category=Hudba');

      expect(res.status).toBe(200);
      expect(res.body.events.every((e: any) => e.category === 'Hudba')).toBe(true);
    });
  });

  describe('POST /api/events', () => {
    it('should create event as organizer', async () => {
      const eventData = {
        title: 'Test Event',
        description: 'This is a test event',
        location: 'Test Location',
        startDate: new Date(Date.now() + 86400000).toISOString(),
        endDate: new Date(Date.now() + 90000000).toISOString(),
        category: 'Party',
        totalTickets: 100,
        ticketPrice: 250,
        status: 'PUBLISHED'
      };

      const res = await request(app)
        .post('/api/events')
        .set('Authorization', `Bearer ${organizerToken}`)
        .send(eventData);

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('event');
      expect(res.body.event.title).toBe(eventData.title);
      
      testEventId = res.body.event.id;
    });

    it('should fail to create event as regular user', async () => {
      const eventData = {
        title: 'Test Event',
        description: 'Test',
        location: 'Test',
        startDate: new Date(Date.now() + 86400000).toISOString(),
        endDate: new Date(Date.now() + 90000000).toISOString(),
        category: 'Party',
        totalTickets: 100,
        ticketPrice: 250,
        status: 'PUBLISHED'
      };

      const res = await request(app)
        .post('/api/events')
        .set('Authorization', `Bearer ${userToken}`)
        .send(eventData);

      expect(res.status).toBe(403);
    });

    it('should fail without authentication', async () => {
      const res = await request(app)
        .post('/api/events')
        .send({});

      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/events/:id', () => {
    it('should get event detail by id', async () => {
      if (!testEventId) {
        // Vytvoř event pokud neexistuje
        const createRes = await request(app)
          .post('/api/events')
          .set('Authorization', `Bearer ${organizerToken}`)
          .send({
            title: 'Detail Test Event',
            description: 'Test',
            location: 'Test',
            startDate: new Date(Date.now() + 86400000).toISOString(),
            endDate: new Date(Date.now() + 90000000).toISOString(),
            category: 'Party',
            totalTickets: 50,
            ticketPrice: 100,
            status: 'PUBLISHED'
          });
        testEventId = createRes.body.event.id;
      }

      const res = await request(app)
        .get(`/api/events/${testEventId}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('event');
      expect(res.body.event.id).toBe(testEventId);
    });

    it('should return 404 for non-existent event', async () => {
      const res = await request(app)
        .get('/api/events/non-existent-id-12345');

      expect(res.status).toBe(404);
    });
  });

  describe('PUT /api/events/:id', () => {
    it('should update own event as organizer', async () => {
      // Nejdřív vytvoříme event
      const eventData = {
        title: 'Event to Update',
        description: 'This event will be updated',
        location: 'Test Location',
        startDate: new Date(Date.now() + 86400000).toISOString(),
        endDate: new Date(Date.now() + 90000000).toISOString(),
        category: 'Hudba',
        totalTickets: 100,
        ticketPrice: 250
      };

      const createRes = await request(app)
        .post('/api/events')
        .set('Authorization', `Bearer ${organizerToken}`)
        .send(eventData);
      
      testEventId = createRes.body.event.id;

      // Pak ho updateujeme
      const res = await request(app)
        .patch(`/api/events/${testEventId}`)
        .set('Authorization', `Bearer ${organizerToken}`)
        .send({
          title: 'Updated Event Title'
        });

      expect(res.status).toBe(200);
      expect(res.body.event.title).toBe('Updated Event Title');
    });

    it('should fail to update without ownership', async () => {
      // Vytvoříme nový event
      const eventData = {
        title: 'Another Event',
        description: 'Test',
        location: 'Test Location',
        startDate: new Date(Date.now() + 86400000).toISOString(),
        endDate: new Date(Date.now() + 90000000).toISOString(),
        category: 'Sport',
        totalTickets: 50,
        ticketPrice: 100
      };

      const createRes = await request(app)
        .post('/api/events')
        .set('Authorization', `Bearer ${organizerToken}`)
        .send(eventData);
      
      const eventId = createRes.body.event.id;

      // Pokusíme se ho updateovat jako jiný user
      const res = await request(app)
        .patch(`/api/events/${eventId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          title: 'Should not work'
        });

      expect(res.status).toBe(403);
    });
  });

  describe('DELETE /api/events/:id', () => {
    it('should soft delete own event as organizer', async () => {
      const eventData = {
        title: 'Event to Delete',
        description: 'Test',
        location: 'Test Location',
        startDate: new Date(Date.now() + 86400000).toISOString(),
        endDate: new Date(Date.now() + 90000000).toISOString(),
        category: 'Sport',
        totalTickets: 50,
        ticketPrice: 100,
        status: 'DRAFT'
      };

      const createRes = await request(app)
        .post('/api/events')
        .set('Authorization', `Bearer ${organizerToken}`)
        .send(eventData);
      
      const eventId = createRes.body.event.id;

      const res = await request(app)
        .delete(`/api/events/${eventId}`)
        .set('Authorization', `Bearer ${organizerToken}`);

      expect(res.status).toBe(200);
      expect(res.body.message).toContain('zrušena');

      // Ověř, že event má status CANCELLED
      const event = await prisma.event.findUnique({
        where: { id: eventId }
      });
      expect(event?.status).toBe('CANCELLED');
    });

    it('should fail to delete without ownership', async () => {
      const eventData = {
        title: 'Event to Try Delete',
        description: 'Test',
        location: 'Test Location',
        startDate: new Date(Date.now() + 86400000).toISOString(),
        endDate: new Date(Date.now() + 90000000).toISOString(),
        category: 'Film',
        totalTickets: 50,
        ticketPrice: 100
      };

      const createRes = await request(app)
        .post('/api/events')
        .set('Authorization', `Bearer ${organizerToken}`)
        .send(eventData);
      
      const eventId = createRes.body.event.id;

      const res = await request(app)
        .delete(`/api/events/${eventId}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(403);
    });

    it('should fail without authentication', async () => {
      const res = await request(app)
        .delete(`/api/events/${testEventId}`);

      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/events/my', () => {
    it('should get organizer events', async () => {
      const res = await request(app)
        .get('/api/events/my')
        .set('Authorization', `Bearer ${organizerToken}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('events');
      expect(Array.isArray(res.body.events)).toBe(true);
    });

    it('should fail without authentication', async () => {
      const res = await request(app)
        .get('/api/events/my');

      expect(res.status).toBe(401);
    });
  });

  describe('Additional Event Tests', () => {
    it('should fail to get non-existent event', async () => {
      const res = await request(app)
        .get('/api/events/non-existent-id');

      expect(res.status).toBe(404);
    });

    it('should fail to update non-existent event', async () => {
      const res = await request(app)
        .patch('/api/events/non-existent-id')
        .set('Authorization', `Bearer ${organizerToken}`)
        .send({ title: 'Updated Title' });

      expect(res.status).toBe(404);
    });

    it('should fail to delete non-existent event', async () => {
      const res = await request(app)
        .delete('/api/events/non-existent-id')
        .set('Authorization', `Bearer ${organizerToken}`);

      expect(res.status).toBe(404);
    });

    it('should create event with valid ticketPrice 0 (free event)', async () => {
      const eventData = {
        title: 'Free Event Test',
        description: 'Free event',
        location: 'Free Location',
        startDate: new Date(Date.now() + 86400000).toISOString(),
        endDate: new Date(Date.now() + 90000000).toISOString(),
        category: 'Vzdělávaní',
        totalTickets: 100,
        ticketPrice: 0,
        status: 'PUBLISHED'
      };

      const res = await request(app)
        .post('/api/events')
        .set('Authorization', `Bearer ${organizerToken}`)
        .send(eventData);

      expect(res.status).toBe(201);
      expect(Number(res.body.event.ticketPrice)).toBe(0);
    });

    it('should fail to create event with missing required fields', async () => {
      const res = await request(app)
        .post('/api/events')
        .set('Authorization', `Bearer ${organizerToken}`)
        .send({
          title: 'Incomplete Event'
        });

      expect(res.status).toBe(400);
    });

    it('should update event partially', async () => {
      const eventData = {
        title: 'Original Title',
        description: 'Original description',
        location: 'Original Location',
        startDate: new Date(Date.now() + 86400000).toISOString(),
        endDate: new Date(Date.now() + 90000000).toISOString(),
        category: 'Hudba',
        totalTickets: 100,
        ticketPrice: 500
      };

      const createRes = await request(app)
        .post('/api/events')
        .set('Authorization', `Bearer ${organizerToken}`)
        .send(eventData);
      
      const eventId = createRes.body.event.id;

      const res = await request(app)
        .patch(`/api/events/${eventId}`)
        .set('Authorization', `Bearer ${organizerToken}`)
        .send({
          title: 'Updated Title Only'
        });

      expect(res.status).toBe(200);
      expect(res.body.event.title).toBe('Updated Title Only');
      expect(res.body.event.description).toBe('Original description');
    });

    it('should filter events by multiple categories', async () => {
      const res = await request(app)
        .get('/api/events')
        .query({ category: 'Hudba,Sport' });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('events');
    });
  });
});
