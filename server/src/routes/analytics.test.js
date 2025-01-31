const request = require('supertest');
const express = require('express');
const auth = require('../middleware/auth.middleware');
const User = require('../models/user.model');
const Activity = require('../models/activity.model');

jest.mock('../middleware/auth.middleware', () => (req, res, next) => next());
jest.mock('../models/user.model');
jest.mock('../models/activity.model');

const app = express();
app.use(express.json());

// Define routes directly
app.get('/stats/registrations', async (req, res) => {
  try {
    const stats = await User.aggregate([
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
            day: { $dayOfMonth: "$createdAt" }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 } }
    ]);
    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching registration stats', error: error.message });
  }
});

app.get('/stats/roles', async (req, res) => {
  try {
    const distribution = await User.aggregate([
      {
        $group: {
          _id: "$role",
          count: { $sum: 1 }
        }
      }
    ]);
    res.json(distribution);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching role distribution', error: error.message });
  }
});

app.get('/stats/login-trends', async (req, res) => {
  try {
    const trends = await Activity.aggregate([
      {
        $match: {
          action: 'logged in'
        }
      },
      {
        $group: {
          _id: {
            year: { $year: "$timestamp" },
            month: { $month: "$timestamp" },
            day: { $dayOfMonth: "$timestamp" }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 } }
    ]);
    res.json(trends);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching login trends', error: error.message });
  }
});

describe('Stats API', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /stats/registrations', () => {
    it('should return user registration stats', async () => {
      const mockStats = [
        { _id: { year: 2024, month: 1, day: 1 }, count: 10 },
        { _id: { year: 2024, month: 1, day: 2 }, count: 15 }
      ];
      User.aggregate.mockResolvedValue(mockStats);
      const response = await request(app).get('/stats/registrations');
      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockStats);
    });

    it('should handle errors gracefully', async () => {
      User.aggregate.mockRejectedValue(new Error('Database error'));
      const response = await request(app).get('/stats/registrations');
      expect(response.status).toBe(500);
      expect(response.body.message).toBe('Error fetching registration stats');
    });
  });

  describe('GET /stats/roles', () => {
    it('should return user role distribution', async () => {
      const mockRoles = [
        { _id: 'admin', count: 5 },
        { _id: 'user', count: 20 }
      ];
      User.aggregate.mockResolvedValue(mockRoles);
      const response = await request(app).get('/stats/roles');
      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockRoles);
    });

    it('should handle errors gracefully', async () => {
      User.aggregate.mockRejectedValue(new Error('Database error'));
      const response = await request(app).get('/stats/roles');
      expect(response.status).toBe(500);
      expect(response.body.message).toBe('Error fetching role distribution');
    });
  });

  describe('GET /stats/login-trends', () => {
    it('should return login activity trends', async () => {
      const mockTrends = [
        { _id: { year: 2024, month: 1, day: 1 }, count: 30 },
        { _id: { year: 2024, month: 1, day: 2 }, count: 25 }
      ];
      Activity.aggregate.mockResolvedValue(mockTrends);
      const response = await request(app).get('/stats/login-trends');
      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockTrends);
    });

    it('should handle errors gracefully', async () => {
      Activity.aggregate.mockRejectedValue(new Error('Database error'));
      const response = await request(app).get('/stats/login-trends');
      expect(response.status).toBe(500);
      expect(response.body.message).toBe('Error fetching login trends');
    });
  });
});