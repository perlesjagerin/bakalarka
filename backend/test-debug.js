const request = require('supertest');
const app = require('./dist/index').default;

async function test() {
  // Nejprve se přihlásím
  const loginRes = await request(app)
    .post('/api/auth/login')
    .send({
      email: 'user@example.com',
      password: 'user123'
    });
  
  const token = loginRes.body.token;
  
  // Pak zkusím update
  const res = await request(app)
    .patch('/api/users/profile')
    .set('Authorization', `Bearer ${token}`)
    .send({
      firstName: 'Updated',
      lastName: 'Name',
      email: 'updated@example.com'
    });
  
  console.log('Status:', res.status);
  console.log('Body:', JSON.stringify(res.body, null, 2));
}

test().catch(console.error);
