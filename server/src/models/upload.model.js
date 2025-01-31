const mongoose = require('mongoose');

// Define CSV Data Schema
const csvSchema = new mongoose.Schema({
    data: [mongoose.Schema.Types.Mixed],
    filename: String,
    uploadDate: { type: Date, default: Date.now }
  });

  module.exports = mongoose.model('CSV', csvSchema);