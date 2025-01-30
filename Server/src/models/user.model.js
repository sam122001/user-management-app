const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['admin', 'editor', 'viewer', 'Admin', 'Editor', 'Viewer'],
    default: 'admin'
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'Active', 'Inactive'],
    default: 'inactive'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  lastLogin: {
    type: Date
  }
});


userSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    const match = await bcrypt.compare(candidatePassword, this.password);
    return match;  // returns true or false
  } catch (error) {
    console.error('Error comparing passwords:', error);
    throw error;
  }
};



module.exports = mongoose.model('User', userSchema);