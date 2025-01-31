const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const CsvData = require('../models/upload.model.js');
const csvRouter = require('../routes/upload.routes.js');
const { parse } = require('csv-parse');


jest.mock('../models/upload.model.js');


jest.setTimeout(10000); 

beforeAll(async () => {
  await mongoose.connect('mongodb://localhost/test-db', { useNewUrlParser: true, useUnifiedTopology: true });
});

afterAll(async () => {
  await mongoose.connection.close();
});

test('should upload a valid CSV file', async () => {
  const app = express();
  app.use(express.json());
  app.use('/csv', csvRouter);

  CsvData.prototype.save = jest.fn().mockResolvedValue({});

  const mockCsvBuffer = Buffer.from('name,age\nAlice,25\nBob,30', 'utf-8');
  const response = await request(app)
    .post('/csv/upload')
    .attach('file', mockCsvBuffer, 'test.csv');

  expect(response.status).toBe(200);
  expect(response.body.message).toBe('File uploaded and processed successfully');
});



// Test 3: Should return an error if no file is uploaded
test('should return an error if no file is uploaded', async () => {
  const app = express();
  app.use(express.json());
  app.use('/csv', csvRouter);

  const response = await request(app).post('/csv/upload');
  expect(response.status).toBe(400);
  expect(response.body.error).toBe('No file uploaded');
});


  

