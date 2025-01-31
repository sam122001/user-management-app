const request = require('supertest');
const express = require('express');
const jwt = require('jsonwebtoken');
const auth = require('./auth.middleware'); // Import the auth middleware

const app = express();

// A simple route to test authentication middleware
app.use(auth); // Use the auth middleware for all routes
app.get('/test', (req, res) => {
  res.status(200).json({ message: 'Access granted' });
});

describe('Auth Middleware', () => {
  let token;

  // Set up a valid token before tests run
  beforeAll(() => {
    const payload = { id: 'user123' }; // Example payload
    token = jwt.sign(payload, process.env.JWT_SECRET || 'your-secret-key');
  });

  it('should return 401 if no token is provided', async () => {
    const response = await request(app).get('/test');
    expect(response.status).toBe(401);
    expect(response.body.message).toBe('No authentication token, access denied');
  });

  it('should return 401 if an invalid token is provided', async () => {
    const response = await request(app)
      .get('/test')
      .set('Authorization', 'Bearer invalidToken');
    expect(response.status).toBe(401);
    expect(response.body.message).toBe('Token verification failed, authorization denied');
  });

  it('should grant access with a valid token', async () => {
    const response = await request(app)
      .get('/test')
      .set('Authorization', `Bearer ${token}`);
    expect(response.status).toBe(200);
    expect(response.body.message).toBe('Access granted');
  });
});
