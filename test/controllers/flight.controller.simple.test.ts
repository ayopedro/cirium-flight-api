import request from 'supertest';
import express from 'express';
import bodyParser from 'body-parser';
import FlightController from '../../src/controllers/flight.controller';

describe('FlightController - Basic Tests', () => {
  let app: express.Application;

  beforeEach(() => {
    app = express();
    app.use(bodyParser.json());
    app.use('/flights', FlightController);
  });

  describe('GET /flights', () => {
    it('should return 200 status', async () => {
      const response = await request(app).get('/flights').expect(200);

      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('data');
    });
  });

  describe('GET /flights/airports', () => {
    it('should return 200 status', async () => {
      const response = await request(app).get('/flights/airports').expect(200);

      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('data');
    });
  });

  describe('GET /flights/:id/details', () => {
    it('should return 400 for non-existent flight', async () => {
      const response = await request(app)
        .get('/flights/nonexistent/details')
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('POST /flights', () => {
    it('should return 400 for invalid data', async () => {
      const invalidData = {
        arrivalAerodrome: '',
        arrivalTime: 'invalid-date',
        departureAerodrome: 'JFK',
        departureTime: '2024-01-01T10:00:00Z',
      };

      const response = await request(app)
        .post('/flights')
        .send(invalidData)
        .expect(400);

      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('errors');
    });

    it('should return 400 for missing required fields', async () => {
      const incompleteData = {
        arrivalAerodrome: 'LAX',
      };

      const response = await request(app)
        .post('/flights')
        .send(incompleteData)
        .expect(400);

      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('errors');
    });
  });

  describe('GET /flights/:id/position', () => {
    it('should return 400 for invalid time format', async () => {
      const response = await request(app)
        .get('/flights/1/position')
        .query({ time: 'invalid-date' })
        .expect(400);

      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('errors');
    });
  });

  describe('GET /flights/:id/in-airspace', () => {
    it('should return 400 for missing airspace coordinates', async () => {
      const response = await request(app)
        .get('/flights/1/in-airspace')
        .query({
          bottomLeftX: -10,
        })
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    it('should return 400 for invalid time format', async () => {
      const response = await request(app)
        .get('/flights/1/in-airspace')
        .query({
          bottomLeftX: -10,
          bottomLeftY: -10,
          topRightX: 10,
          topRightY: 10,
          time: 'invalid-date',
        })
        .expect(400);

      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('errors');
    });
  });
});
