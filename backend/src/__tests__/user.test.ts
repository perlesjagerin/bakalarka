import request from 'supertest';
import { PrismaClient } from '@prisma/client';
import app from '../index';

const prisma = new PrismaClient();

describe('User Endpoints', () => {
  let userToken: string;
  let adminToken: string;
  let testUserId: string;
  let testUserEmail: string;

  beforeAll(async () => {
    // Vytvoření testovacího uživatele
    testUserEmail = `user.profile.${Date.now()}@test.com`;
    const userRes = await request(app)
      .post('/api/auth/register')
      .send({
        email: testUserEmail,
        password: 'TestPass123!',
        firstName: 'Test',
        lastName: 'User',
        role: 'USER'
      });
    userToken = userRes.body.token;
    testUserId = userRes.body.user.id;

    // Vytvoření admin uživatele přímo v databázi
    const bcrypt = require('bcryptjs');
    const hashedPassword = await bcrypt.hash('AdminPass123!', 10);
    const adminUser = await prisma.user.create({
      data: {
        email: `admin.users.${Date.now()}@test.com`,
        password: hashedPassword,
        firstName: 'Admin',
        lastName: 'Test',
        role: 'ADMIN'
      }
    });

    // Přihlášení admina pro získání tokenu
    const adminLoginRes = await request(app)
      .post('/api/auth/login')
      .send({
        email: adminUser.email,
        password: 'AdminPass123!'
      });
    adminToken = adminLoginRes.body.token;
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe('GET /api/users', () => {
    it('should get all users as admin', async () => {
      const res = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('users');
      expect(Array.isArray(res.body.users)).toBe(true);
    });

    it('should fail without admin role', async () => {
      const res = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(403);
    });

    it('should fail without authentication', async () => {
      const res = await request(app)
        .get('/api/users');

      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/users/:id', () => {
    it('should get current user profile', async () => {
      const res = await request(app)
        .get(`/api/users/${testUserId}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('user');
      expect(res.body.user.id).toBe(testUserId);
      expect(res.body.user).not.toHaveProperty('password');
    });

    it('should fail without authentication', async () => {
      const res = await request(app)
        .get(`/api/users/${testUserId}`);

      expect(res.status).toBe(401);
    });
  });

  describe('PATCH /api/users/profile', () => {
    it('should update current user profile', async () => {
      const updatedEmail = `updated.${Date.now()}@test.com`;
      const res = await request(app)
        .patch('/api/users/profile')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          firstName: 'Updated',
          lastName: 'Name',
          email: updatedEmail
        });

      expect(res.status).toBe(200);
      expect(res.body.user.firstName).toBe('Updated');
      expect(res.body.user.lastName).toBe('Name');
      expect(res.body.user.email).toBe(updatedEmail);
      
      // Aktualizujeme testUserEmail pro následující testy
      testUserEmail = updatedEmail;
    });

    it('should fail without authentication', async () => {
      const res = await request(app)
        .patch('/api/users/profile')
        .send({
          firstName: 'Updated'
        });

      expect(res.status).toBe(401);
    });
  });

  describe('PATCH /api/users/password', () => {
    it('should change password with correct old password', async () => {
      const res = await request(app)
        .patch('/api/users/password')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          currentPassword: 'TestPass123!',
          newPassword: 'NewTestPass123!'
        });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('message');

      // Ověříme, že nové heslo funguje
      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUserEmail,
          password: 'NewTestPass123!'
        });

      expect(loginRes.status).toBe(200);
    });

    it('should fail with incorrect old password', async () => {
      const res = await request(app)
        .patch('/api/users/password')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          oldPassword: 'WrongPassword123!',
          newPassword: 'NewTestPass123!'
        });

      expect(res.status).toBe(400);
    });

    it('should fail without authentication', async () => {
      const res = await request(app)
        .patch('/api/users/password')
        .send({
          oldPassword: 'TestPass123!',
          newPassword: 'NewTestPass123!'
        });

      expect(res.status).toBe(401);
    });
  });

  describe('DELETE /api/users/:id', () => {
    it('should delete user as admin', async () => {
      // Vytvoříme nového uživatele k smazání
      const newUserRes = await request(app)
        .post('/api/auth/register')
        .send({
          email: `user.to.delete.${Date.now()}@test.com`,
          password: 'TestPass123!',
          firstName: 'ToDelete',
          lastName: 'User',
          role: 'USER'
        });
      
      const userToDeleteId = newUserRes.body.user.id;

      const res = await request(app)
        .delete(`/api/users/${userToDeleteId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.message).toContain('deaktivován');
    });

    it('should fail without admin role', async () => {
      const res = await request(app)
        .delete(`/api/users/${testUserId}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(403);
    });

    it('should fail without authentication', async () => {
      const res = await request(app)
        .delete(`/api/users/${testUserId}`);

      expect(res.status).toBe(401);
    });
  });

  describe('PUT /api/users/:id', () => {
    it('should update user by admin', async () => {
      // Vytvoříme nového uživatele k úpravě
      const newUserRes = await request(app)
        .post('/api/auth/register')
        .send({
          email: `user.for.update.${Date.now()}@test.com`,
          password: 'TestPass123!',
          firstName: 'ToUpdate',
          lastName: 'User',
          role: 'USER'
        });
      
      const userToUpdateId = newUserRes.body.user.id;

      const res = await request(app)
        .put(`/api/users/${userToUpdateId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          firstName: 'UpdatedFirst',
          lastName: 'UpdatedLast',
          email: `updated.${Date.now()}@test.com`
        });

      expect(res.status).toBe(200);
      expect(res.body.user.firstName).toBe('UpdatedFirst');
      expect(res.body.user.lastName).toBe('UpdatedLast');
    });

    it('should fail without authentication', async () => {
      const res = await request(app)
        .put(`/api/users/${testUserId}`)
        .send({
          firstName: 'Should',
          lastName: 'Fail'
        });

      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/users/:id - additional tests', () => {
    it('should fail when trying to view other user profile', async () => {
      // Vytvoříme nového uživatele
      const otherUserRes = await request(app)
        .post('/api/auth/register')
        .send({
          email: `other.profile.${Date.now()}@test.com`,
          password: 'TestPass123!',
          firstName: 'Other',
          lastName: 'Profile',
          role: 'USER'
        });
      const otherUserId = otherUserRes.body.user.id;

      const res = await request(app)
        .get(`/api/users/${otherUserId}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(403);
    });

    it('should allow admin to view any user profile', async () => {
      const res = await request(app)
        .get(`/api/users/${testUserId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.user.id).toBe(testUserId);
    });
  });

  describe('PATCH /api/users/profile - additional tests', () => {
    it('should fail with missing fields', async () => {
      const res = await request(app)
        .patch('/api/users/profile')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          firstName: 'OnlyFirst'
          // lastName a email chybí
        });

      expect(res.status).toBe(400);
    });

    it('should fail with duplicate email', async () => {
      // Vytvoříme nového uživatele s konkrétním emailem
      const otherUserRes = await request(app)
        .post('/api/auth/register')
        .send({
          email: `duplicate.email.${Date.now()}@test.com`,
          password: 'TestPass123!',
          firstName: 'Duplicate',
          lastName: 'Email',
          role: 'USER'
        });
      
      const duplicateEmail = otherUserRes.body.user.email;

      // Pokusíme se změnit email aktuálního uživatele na již existující
      const res = await request(app)
        .patch('/api/users/profile')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          firstName: 'Test',
          lastName: 'User',
          email: duplicateEmail
        });

      expect(res.status).toBe(400);
      expect(res.body.error).toContain('již používá');
    });
  });

  // Note: toggle-active endpoint není implementován, proto jsou testy zakomentovány
  // describe('PATCH /api/users/:id/toggle-active', () => {
  //   it('should toggle user active status as admin', async () => {
  //     const res = await request(app)
  //       .patch(`/api/users/${testUserId}/toggle-active`)
  //       .set('Authorization', `Bearer ${adminToken}`);

  //     expect(res.status).toBe(200);
  //     expect(res.body).toHaveProperty('user');
  //     expect(typeof res.body.user.isActive).toBe('boolean');
  //   });

  //   it('should fail without admin role', async () => {
  //     const res = await request(app)
  //       .patch(`/api/users/${testUserId}/toggle-active`)
  //       .set('Authorization', `Bearer ${userToken}`);

  //     expect(res.status).toBe(403);
  //   });

  //   it('should fail without authentication', async () => {
  //     const res = await request(app)
  //       .patch(`/api/users/${testUserId}/toggle-active`);

  //     expect(res.status).toBe(401);
  //   });
  // });
});
