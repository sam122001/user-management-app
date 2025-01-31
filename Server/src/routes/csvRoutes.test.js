const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');
const CsvData = require('../models/upload.model'); // Adjust the path
const csvRouter = require('./upload.routes'); // Adjust the path

const app = express();
app.use(express.json());
app.use('/api/csv', csvRouter);

beforeAll(async () => {
  jest.setTimeout(30000); // Increase Jest timeout (optional)
  
  const mongoUri = 'mongodb://127.0.0.1:27017/testdb'; // Use a test database
  await mongoose.connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true });
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
});

describe('CSV Upload API', () => {      

  test('Should upload and save a valid CSV file', async () => {
    const csvData = 'name,age\nAlice,25\nBob,30';
    
    const res = await request(app)
      .post('/api/csv/upload')
      .attach('file', Buffer.from(csvData), 'test.csv');

    expect(res.status).toBe(200);
    expect(res.body.message).toBe('File uploaded and processed successfully');
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBe(2);
  });

  test('Should retrieve uploaded CSV data', async () => {
    const res = await request(app).get('/api/csv/uploads');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});
