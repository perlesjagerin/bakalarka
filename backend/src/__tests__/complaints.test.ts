import request from 'supertest';
import { PrismaClient } from '@prisma/client';
import app from '../index';

const prisma = new PrismaClient();

describe('Complaint Endpoints', () => {
  let userToken: string;
  let adminToken: string;
  let organizerToken: string;
  let testEventId: string;
  let testReservationId: string;
  let testComplaintId: string;

  beforeAll(async () => {
    // Vytvoření běžného uživatele
    const userRes = await request(app)
      .post('/api/auth/register')
      .send({
        email: `user.complaints.${Date.now()}@test.com`,
        password: 'TestPass123!',
        firstName: 'Test',
        lastName: 'User',
        role: 'USER'
      });
    userToken = userRes.body.token;

    // Vytvoření organizátora
    const organizerRes = await request(app)
      .post('/api/auth/register')
      .send({
        email: `organizer.complaints.${Date.now()}@test.com`,
        password: 'OrganizerPass123!',
        firstName: 'Test',
        lastName: 'Organizer',
        role: 'ORGANIZER'
      });
    organizerToken = organizerRes.body.token;

    // Vytvoření admin uživatele
    const bcrypt = require('bcryptjs');
    const hashedPassword = await bcrypt.hash('AdminPass123!', 10);
    const adminUser = await prisma.user.create({
      data: {
        email: `admin.complaints.${Date.now()}@test.com`,
        password: hashedPassword,
        firstName: 'Admin',
        lastName: 'Test',
        role: 'ADMIN'
      }
    });

    const adminLoginRes = await request(app)
      .post('/api/auth/login')
      .send({
        email: adminUser.email,
        password: 'AdminPass123!'
      });
    adminToken = adminLoginRes.body.token;

    // Vytvoření testovací akce
    const eventRes = await request(app)
      .post('/api/events')
      .set('Authorization', `Bearer ${organizerToken}`)
      .send({
        title: 'Test Event for Complaints',
        description: 'Description',
        location: 'Test Location',
        startDate: new Date(Date.now() + 86400000).toISOString(),
        endDate: new Date(Date.now() + 90000000).toISOString(),
        category: 'Hudba',
        totalTickets: 100,
        ticketPrice: 0,
        status: 'PUBLISHED'
      });
    testEventId = eventRes.body.event.id;

    // Vytvoření rezervace
    const reservationRes = await request(app)
      .post('/api/reservations')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        eventId: testEventId,
        ticketCount: 2
      });
    testReservationId = reservationRes.body.reservation.id;

    // Vytvoření reklamace pro testy
    const complaintRes = await request(app)
      .post('/api/complaints')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        reservationId: testReservationId,
        reason: 'Initial test complaint',
        description: 'Complaint for testing GET and PATCH endpoints'
      });
    testComplaintId = complaintRes.body.complaint.id;
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe('POST /api/complaints', () => {
    it('should create a complaint successfully', async () => {
      // Create a new complaint (testComplaintId was already created in beforeAll)
      const res = await request(app)
        .post('/api/complaints')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          reservationId: testReservationId,
          reason: 'Another test complaint',
          description: 'Testing complaint creation endpoint'
        });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('complaint');
      expect(res.body.complaint.reason).toBe('Another test complaint');
      expect(res.body.complaint.status).toBe('SUBMITTED');
    });

    it('should fail without authentication', async () => {
      const res = await request(app)
        .post('/api/complaints')
        .send({
          reservationId: testReservationId,
          reason: 'Test reason',
          description: 'Test description'
        });

      expect(res.status).toBe(401);
    });

    it('should fail with invalid reservation', async () => {
      const res = await request(app)
        .post('/api/complaints')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          reservationId: '00000000-0000-0000-0000-000000000000',
          reason: 'Test reason',
          description: 'Test description'
        });

      expect(res.status).toBe(404);
    });
  });

  describe('GET /api/complaints/my', () => {
    it('should get user complaints', async () => {
      const res = await request(app)
        .get('/api/complaints/my')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('complaints');
      expect(Array.isArray(res.body.complaints)).toBe(true);
      expect(res.body.complaints.length).toBeGreaterThan(0);
    });

    it('should fail without authentication', async () => {
      const res = await request(app)
        .get('/api/complaints/my');

      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/complaints/:id', () => {
    it('should get complaint by id', async () => {
      const res = await request(app)
        .get(`/api/complaints/${testComplaintId}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('complaint');
      expect(res.body.complaint.id).toBe(testComplaintId);
    });

    it('should return 404 for non-existent complaint', async () => {
      const res = await request(app)
        .get('/api/complaints/00000000-0000-0000-0000-000000000000')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(404);
    });
  });

  describe('GET /api/complaints/all (admin)', () => {
    it('should get all complaints as admin', async () => {
      const res = await request(app)
        .get('/api/complaints/all')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('complaints');
      expect(Array.isArray(res.body.complaints)).toBe(true);
    });

    it('should fail without admin role', async () => {
      const res = await request(app)
        .get('/api/complaints/all')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(403);
    });
  });

  describe('PUT /api/complaints/:id/status', () => {
    it('should update complaint status as admin', async () => {
      const res = await request(app)
        .put(`/api/complaints/${testComplaintId}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          status: 'IN_REVIEW',
          adminResponse: 'We are looking into your complaint'
        });

      expect(res.status).toBe(200);
      expect(res.body.complaint.status).toBe('IN_REVIEW');
      expect(res.body.complaint.adminResponse).toBe('We are looking into your complaint');
    });

    it('should fail without admin role', async () => {
      const res = await request(app)
        .put(`/api/complaints/${testComplaintId}/status`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          status: 'RESOLVED'
        });

      expect(res.status).toBe(403);
    });
  });

  describe('POST /api/complaints/:id/resolve', () => {
    it('should resolve complaint without refund as admin', async () => {
      // Vytvoříme novou reklamaci pro test
      const newComplaintRes = await request(app)
        .post('/api/complaints')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          reservationId: testReservationId,
          reason: 'Test for resolve',
          description: 'This complaint will be resolved without refund'
        });
      const complaintId = newComplaintRes.body.complaint.id;

      const res = await request(app)
        .post(`/api/complaints/${complaintId}/resolve`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          adminResponse: 'We have reviewed your complaint and found it invalid',
          shouldRefund: false
        });

      expect(res.status).toBe(200);
      expect(res.body.complaint.status).toBe('RESOLVED');
      expect(res.body.complaint.adminResponse).toBe('We have reviewed your complaint and found it invalid');
      expect(res.body.complaint.refundIssued).toBe(false);
    });

    it('should resolve complaint with refund as admin', async () => {
      // Vytvoříme placený event a rezervaci pro test refundu
      const organizerRes = await request(app)
        .post('/api/auth/register')
        .send({
          email: `organizer.refund.${Date.now()}@test.com`,
          password: 'OrganizerPass123!',
          firstName: 'Refund',
          lastName: 'Organizer',
          role: 'ORGANIZER'
        });
      const organizerToken = organizerRes.body.token;

      const paidEventRes = await request(app)
        .post('/api/events')
        .set('Authorization', `Bearer ${organizerToken}`)
        .send({
          title: 'Paid Event for Refund Test',
          description: 'Description',
          location: 'Test Location',
          startDate: new Date(Date.now() + 86400000).toISOString(),
          endDate: new Date(Date.now() + 90000000).toISOString(),
          category: 'Sport',
          totalTickets: 50,
          ticketPrice: 500,
          status: 'PUBLISHED'
        });

      const paidReservationRes = await request(app)
        .post('/api/reservations')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          eventId: paidEventRes.body.event.id,
          ticketCount: 2
        });

      // Vytvoříme payment intent (simulace platby)
      await request(app)
        .post('/api/payments/create-payment-intent')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          reservationId: paidReservationRes.body.reservation.id
        });

      // Manuálně nastavíme rezervaci jako PAID s platbou
      await prisma.reservation.update({
        where: { id: paidReservationRes.body.reservation.id },
        data: { status: 'PAID' as any }
      });

      const refundComplaintRes = await request(app)
        .post('/api/complaints')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          reservationId: paidReservationRes.body.reservation.id,
          reason: 'Event was cancelled',
          description: 'The event was cancelled and I want a refund'
        });

      const res = await request(app)
        .post(`/api/complaints/${refundComplaintRes.body.complaint.id}/resolve`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          adminResponse: 'We apologize for the inconvenience. Refund has been processed.',
          shouldRefund: true
        });

      expect(res.status).toBe(200);
      expect(res.body.complaint.status).toBe('RESOLVED');
      expect(res.body.complaint.refundIssued).toBe(true);
      
      // Ověř, že rezervace byla zrušena
      const reservation = await prisma.reservation.findUnique({
        where: { id: paidReservationRes.body.reservation.id }
      });
      expect(reservation?.status).toBe('REFUNDED');
    });

    it('should fail without admin role', async () => {
      const res = await request(app)
        .post(`/api/complaints/${testComplaintId}/resolve`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          adminResponse: 'Should not work',
          shouldRefund: false
        });

      expect(res.status).toBe(403);
    });

    it('should fail for non-existent complaint', async () => {
      const res = await request(app)
        .post('/api/complaints/00000000-0000-0000-0000-000000000000/resolve')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          adminResponse: 'Test',
          shouldRefund: false
        });

      expect(res.status).toBe(404);
    });
  });

  describe('GET /api/complaints/:id - additional tests', () => {
    it('should fail for complaint not owned by user', async () => {
      // Vytvoříme nového uživatele
      const otherUserRes = await request(app)
        .post('/api/auth/register')
        .send({
          email: `other.user.${Date.now()}@test.com`,
          password: 'TestPass123!',
          firstName: 'Other',
          lastName: 'User',
          role: 'USER'
        });

      const res = await request(app)
        .get(`/api/complaints/${testComplaintId}`)
        .set('Authorization', `Bearer ${otherUserRes.body.token}`);

      expect(res.status).toBe(403);
    });

    it('should allow admin to view any complaint', async () => {
      const res = await request(app)
        .get(`/api/complaints/${testComplaintId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.complaint.id).toBe(testComplaintId);
    });

    it('should fail to refund a free event (amount = 0)', async () => {
      // Vytvoříme zdarma akci
      const freeEventRes = await request(app)
        .post('/api/events')
        .set('Authorization', `Bearer ${organizerToken}`)
        .send({
          title: 'Free Event for Refund Test',
          description: 'Test Description',
          location: 'Test Location',
          startDate: new Date(Date.now() + 86400000).toISOString(),
          endDate: new Date(Date.now() + 90000000).toISOString(),
          category: 'Vzdělávání',
          totalTickets: 50,
          ticketPrice: 0, // ZDARMA
          status: 'PUBLISHED'
        });

      // Vytvoříme rezervaci na zdarma akci
      const freeReservationRes = await request(app)
        .post('/api/reservations')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          eventId: freeEventRes.body.event.id,
          ticketCount: 2
        });

      expect(freeReservationRes.body.reservation.status).toBe('CONFIRMED');
      expect(Number(freeReservationRes.body.reservation.totalAmount)).toBe(0);

      // Vytvoříme reklamaci
      const freeComplaintRes = await request(app)
        .post('/api/complaints')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          reservationId: freeReservationRes.body.reservation.id,
          reason: 'Cannot attend',
          description: 'I want a refund for this free event'
        });

      // Pokusíme se schválit refundaci pro akci zdarma - mělo by selhat
      const res = await request(app)
        .post(`/api/complaints/${freeComplaintRes.body.complaint.id}/resolve`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          adminResponse: 'Attempting refund for free event',
          shouldRefund: true
        });

      expect(res.status).toBe(400);
      expect(res.body.message || res.body.error).toContain('zdarma');
    });
  });
});
