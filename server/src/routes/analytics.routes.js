const express = require('express');
const auth = require('../middleware/auth.middleware');
const User = require('../models/user.model');
const Activity = require('../models/activity.model');

const router = express.Router();

// Get user registration stats
router.get('/registrations', auth, async (req, res) => {
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

// Get user role distribution
router.get('/roles', auth, async (req, res) => {
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

// Get login activity trends
router.get('/login-trends', auth, async (req, res) => {
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

module.exports = router;