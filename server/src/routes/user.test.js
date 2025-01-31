const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');
const User = require('../models/user.model');
const Activity = require('../models/activity.model');
const authenticateToken = require('../middleware/authenticateToken');
const usersRouter = require('../routes/user.routes');

// Mock the authenticateToken middleware
jest.mock('../middleware/authenticateToken');

const app = express();
app.use(express.json());
app.use('/users', usersRouter);

// Mock the Mongoose models
jest.mock('../models/user.model');
jest.mock('../models/activity.model');

describe('Users API', () => {

  beforeAll(() => {
    // Initialize the database connection if needed (you can also use an in-memory DB like `mongodb-memory-server` for isolated tests)
    mongoose.connect('mongodb://localhost:27017/test', { useNewUrlParser: true, useUnifiedTopology: true });
  });

  afterEach(() => {
    jest.clearAllMocks(); // Clear mocks after each test
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  // Test: Fetch all users (admin only)
  test('should fetch all users (admin only)', async () => {
    authenticateToken.mockImplementation((req, res, next) => {
      req.user = { role: 'admin' }; // Mock admin user
      next();
    });

    const mockUsers = [{ username: 'testuser', email: 'test@example.com' }];
    User.find = jest.fn().mockResolvedValue(mockUsers);

    const response = await request(app).get('/users');

    expect(response.status).toBe(200);
    expect(response.body).toEqual(mockUsers);
  });

  test('should deny access to non-admin users when fetching all users', async () => {
    authenticateToken.mockImplementation((req, res, next) => {
      req.user = { role: 'user' }; // Mock regular user
      next();
    });

    const response = await request(app).get('/users');

    expect(response.status).toBe(403);
    expect(response.body.message).toBe('Access denied');
  });

  // Test: Get user by ID
  test('should fetch a user by ID (admin)', async () => {
    authenticateToken.mockImplementation((req, res, next) => {
      req.user = { role: 'admin', id: '1' }; // Mock admin user
      next();
    });

    const mockUser = { id: '1', username: 'testuser', email: 'test@example.com' };
    User.findById = jest.fn().mockResolvedValue(mockUser);

    const response = await request(app).get('/users/1');

    expect(response.status).toBe(200);
    expect(response.body).toEqual(mockUser);
  });

  test('should deny access if user is not admin or the same user when fetching user by ID', async () => {
    authenticateToken.mockImplementation((req, res, next) => {
      req.user = { role: 'user', id: '2' }; // Mock a non-admin user who tries to access another user's info
      next();
    });

    const response = await request(app).get('/users/1');

    expect(response.status).toBe(403);
    expect(response.body.message).toBe('Access denied');
  });

  // Test: Add a new user (admin only)
  test('should allow admin to add a user', async () => {
    authenticateToken.mockImplementation((req, res, next) => {
      req.user = { role: 'admin' }; // Mock admin user
      next();
    });

    const newUser = {
      username: 'newuser',
      email: 'newuser@example.com',
      password: 'password123',
      role: 'Viewer',
      status: 'active',
    };

    User.findOne = jest.fn().mockResolvedValue(null); // Mock that the email does not exist
    User.prototype.save = jest.fn().mockResolvedValue(newUser); // Mock save function

    const response = await request(app)
      .post('/users/adduser')
      .send(newUser);

    expect(response.status).toBe(201);
    expect(response.body.message).toBe('User created successfully');
  });

  test('should reject when non-admin tries to add a user', async () => {
    authenticateToken.mockImplementation((req, res, next) => {
      req.user = { role: 'user' }; // Mock regular user
      next();
    });

    const response = await request(app)
      .post('/users/adduser')
      .send({
        username: 'newuser',
        email: 'newuser@example.com',
        password: 'password123',
        role: 'Viewer',
        status: 'active',
      });

    expect(response.status).toBe(403);
    expect(response.body.message).toBe('Access denied');
  });

  // Test: Update user
  test('should allow user to update their own profile', async () => {
    authenticateToken.mockImplementation((req, res, next) => {
      req.user = { role: 'user', id: '1' }; // Mock regular user updating their profile
      next();
    });

    const updateData = { username: 'updateduser', email: 'updated@example.com' };
    User.findByIdAndUpdate = jest.fn().mockResolvedValue({
      ...updateData,
      id: '1',
    });

    const response = await request(app).put('/users/1').send(updateData);

    expect(response.status).toBe(200);
    expect(response.body.username).toBe(updateData.username);
  });

  test('should deny access to update profile of other users', async () => {
    authenticateToken.mockImplementation((req, res, next) => {
      req.user = { role: 'user', id: '2' }; // Mock user trying to update another user's profile
      next();
    });

    const response = await request(app).put('/users/1').send({
      username: 'updateduser',
      email: 'updated@example.com',
    });

    expect(response.status).toBe(403);
    expect(response.body.message).toBe('Access denied');
  });

  // Test: Delete user
  test('should allow admin to delete a user', async () => {
    authenticateToken.mockImplementation((req, res, next) => {
      req.user = { role: 'admin' }; // Mock admin user
      next();
    });

    User.findByIdAndDelete = jest.fn().mockResolvedValue({
      id: '1',
      username: 'deleteduser',
    });

    const response = await request(app).delete('/users/1');

    expect(response.status).toBe(200);
    expect(response.body.message).toBe('User deleted successfully');
  });

  test('should deny non-admin from deleting a user', async () => {
    authenticateToken.mockImplementation((req, res, next) => {
      req.user = { role: 'user' }; // Mock non-admin user trying to delete another user
      next();
    });

    const response = await request(app).delete('/users/1');

    expect(response.status).toBe(403);
    expect(response.body.message).toBe('Access denied');
  });
});
