const request = require('supertest');
const express = require('express');
const jwt = require('jsonwebtoken');
const authenticateToken = require('./authenticateToken'); // Import the authenticateToken middleware

const app = express();

// A simple route that requires authentication
app.use(authenticateToken); // Apply the middleware
app.get('/protected', (req, res) => {
  res.status(200).json({ message: 'Protected route accessed', user: req.user });
});

describe('Authenticate Token Middleware', () => {
  let token;

  // Setup a valid token before running tests
  beforeAll(() => {
    const payload = { id: 'user123', role: 'admin' }; // Example payload
    token = jwt.sign(payload, process.env.JWT_SECRET || 'your-secret-key', { expiresIn: '1h' });
  });

  it('should return 401 if no token is provided', async () => {
    const response = await request(app).get('/protected');
    expect(response.status).toBe(401);
    expect(response.body.message).toBe('Access Denied: No Token Provided');
  });

  it('should return 403 if an invalid token is provided', async () => {
    const response = await request(app)
      .get('/protected')
      .set('Authorization', 'Bearer invalidToken'); // Invalid token
    expect(response.status).toBe(403);
    expect(response.body.message).toBe('Invalid or Expired Token');
  });

  it('should return 200 and user data if a valid token is provided', async () => {
    const response = await request(app)
      .get('/protected')
      .set('Authorization', `Bearer ${token}`); // Valid token

    expect(response.status).toBe(200);
    expect(response.body.message).toBe('Protected route accessed');
    expect(response.body.user.id).toBe('user123'); // Verify the decoded user info
  });

  it('should return 403 if the token is expired', async () => {
    // Create an expired token
    const expiredToken = jwt.sign({ id: 'user123' }, process.env.JWT_SECRET || 'your-secret-key', { expiresIn: '1s' });
    
    // Wait for a second to let the token expire
    await new Promise((resolve) => setTimeout(resolve, 2000));

    const response = await request(app)
      .get('/protected')
      .set('Authorization', `Bearer ${expiredToken}`);

    expect(response.status).toBe(403);
    expect(response.body.message).toBe('Invalid or Expired Token');
  });
});
