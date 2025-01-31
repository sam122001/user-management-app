const express = require('express');
const auth = require('../middleware/auth.middleware');
const User = require('../models/user.model');
const Activity = require('../models/activity.model');
const authenticateToken = require('../middleware/authenticateToken');

const router = express.Router();
const bcrypt = require('bcryptjs');

// Fetch all users (admin only)
router.get('/', authenticateToken, async (req, res) => {
  try {

    // Check if the user has the 'admin' role
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Fetch all users, excluding passwords
    const users = await User.find({}, '-password'); // Excludes the 'password' field
    res.json(users); // Return users in array format
  } catch (error) {
    console.error("Error fetching users:", error.message);
    res.status(500).json({ message: 'Error fetching users', error: error.message });
  }
});


// Get user by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.params.id, '-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Only allow admins or the user themselves to view the details
    if (req.user.role !== 'admin' && req.user.id !== req.params.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching user', error: error.message });
  }
});

// Add a new user (admin only)
router.post('/adduser', authenticateToken, async (req, res) => {
  try {
    // Check if the user is an admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Get the user data from the request body
    const { username, email, password, role, status } = req.body;

    // Check if the required fields are provided
    if (!username || !email || !password) {
      return res.status(400).json({ message: 'Username, email, and password are required' });
    }

    // Check if the email already exists in the database
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user instance
    const newUser = new User({
      username,
      email,
      password: hashedPassword,
      role: role || 'Viewer', // Default role is 'user'
      status: status,
    });

    // Save the user to the database
    await newUser.save();

    // Respond with the newly created user
    res.status(201).json({
      message: 'User created successfully',
      user: {
        id: newUser._id,
        username: newUser.username,
        email: newUser.email,
        role: newUser.role,
      }
    });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ message: 'Error creating user', error: error.message });
  }
});



// Update user
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    // Only allow admins or the user themselves to update
    if (req.user.role !== 'admin' && req.user.id !== req.params.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const { username, email, role, status } = req.body;
    const updateData = { username, email, status };

    // Only admin can update roles
    if (req.user.role === 'admin' && role) {
      updateData.role = role;
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, select: '-password' }
    );

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    await Activity.create({
      user: user._id,
      action: 'profile updated'
    });

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error updating user', error: error.message });
  }
});

// Delete user
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    // Only admin can delete users
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    await Activity.create({
      user: req.user.id,
      action: `deleted user ${user.username}`
    });

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting user', error: error.message });
  }
});

module.exports = router;