const express = require('express');
const multer = require('multer');
const { parse } = require('csv-parse');
const { Buffer } = require('buffer');
const mongoose = require('mongoose');
const path = require('path');

const router = express.Router();

// Define your MongoDB schema and model
const csvSchema = new mongoose.Schema({
  data: { type: Array, required: true },
  filename: { type: String, required: true },
  uploadDate: { type: Date, default: Date.now },
});
const CsvData = mongoose.model('CsvData', csvSchema);

// Set up multer for file uploads (in-memory storage)
const upload = multer({
  storage: multer.memoryStorage(), // Store file in memory (buffer)
  fileFilter: (req, file, cb) => {
    if (file.mimetype !== 'text/csv') {
      return cb(new Error('Only CSV files are allowed!'), false);
    }
    cb(null, true);
  },
});

// Upload endpoint
router.post('/upload', upload.single('file'), async (req, res) => {

  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  // Validate file extension
  const ext = path.extname(req.file.originalname).toLowerCase();
  if (ext !== '.csv') {
    return res.status(400).json({ error: 'Invalid file format. Please upload a CSV file.' });
  }

  try {
    const results = [];
    const parser = parse(req.file.buffer, {
      columns: true, // Treat the first row as column headers
      skip_empty_lines: true,
      bom: true, // Handle UTF-8 BOM
    });

    for await (const record of parser) {
      results.push(record);
    }

    // Check if data is empty
    if (results.length === 0) {
      return res.status(400).json({ error: 'CSV file is empty or improperly formatted.' });
    }

    // Save parsed data to MongoDB
    const csvData = new CsvData({
      data: results,
      filename: req.file.originalname,
    });

    await csvData.save();

    res.json({ message: 'File uploaded and processed successfully', data: results });
  } catch (error) {
    console.error('Error processing file:', error);
    res.status(400).json({ error: 'Error processing CSV file. Ensure it is correctly formatted.' });
  }
});

// Get all uploads endpoint
router.get('/uploads', async (req, res) => {
  try {
    const uploads = await CsvData.find().sort({ uploadDate: -1 });
    res.json(uploads);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching uploads' });
  }
});

module.exports = router;
