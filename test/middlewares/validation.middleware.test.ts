import { Request, Response, NextFunction } from 'express';
import { validationMiddleware } from '../../src/middlewares/validation.middleware';
import { CreateFlightDto } from '../../src/services/dto/create-flight.dto';

describe('validationMiddleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockRequest = {
      body: {},
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    mockNext = jest.fn();
  });

  describe('with valid data', () => {
    it('should call next() when validation passes', async () => {
      mockRequest.body = {
        arrivalAerodrome: 'LAX',
        arrivalTime: '2024-01-01T12:00:00Z',
        departureAerodrome: 'JFK',
        departureTime: '2024-01-01T10:00:00Z',
      };

      const middleware = validationMiddleware(CreateFlightDto);
      await middleware(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalled();
      expect(mockResponse.status).not.toHaveBeenCalled();
      expect(mockResponse.json).not.toHaveBeenCalled();
    });

    it('should replace request body with validated DTO', async () => {
      mockRequest.body = {
        arrivalAerodrome: 'LAX',
        arrivalTime: '2024-01-01T12:00:00Z',
        departureAerodrome: 'JFK',
        departureTime: '2024-01-01T10:00:00Z',
      };

      const middleware = validationMiddleware(CreateFlightDto);
      await middleware(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockRequest.body).toBeInstanceOf(CreateFlightDto);
      expect(mockRequest.body.arrivalAerodrome).toBe('LAX');
      expect(mockRequest.body.arrivalTime).toBe('2024-01-01T12:00:00Z');
    });
  });

  describe('with invalid data', () => {
    it('should return 400 status when required fields are missing', async () => {
      mockRequest.body = {
        arrivalAerodrome: 'LAX',
        // Missing other required fields
      };

      const middleware = validationMiddleware(CreateFlightDto);
      await middleware(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Validation failed',
        errors: expect.any(Array),
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return validation errors for invalid data types', async () => {
      mockRequest.body = {
        arrivalAerodrome: 123, // Should be string
        arrivalTime: 'invalid-date', // Should be valid date
        departureAerodrome: 'JFK',
        departureTime: '2024-01-01T10:00:00Z',
      };

      const middleware = validationMiddleware(CreateFlightDto);
      await middleware(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Validation failed',
        errors: expect.any(Array),
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return validation errors for empty strings', async () => {
      mockRequest.body = {
        arrivalAerodrome: '',
        arrivalTime: '2024-01-01T12:00:00Z',
        departureAerodrome: 'JFK',
        departureTime: '2024-01-01T10:00:00Z',
      };

      const middleware = validationMiddleware(CreateFlightDto);
      await middleware(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Validation failed',
        errors: expect.any(Array),
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return validation errors for null values', async () => {
      mockRequest.body = {
        arrivalAerodrome: null,
        arrivalTime: null,
        departureAerodrome: null,
        departureTime: null,
      };

      const middleware = validationMiddleware(CreateFlightDto);
      await middleware(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Validation failed',
        errors: expect.any(Array),
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return validation errors for undefined values', async () => {
      mockRequest.body = {
        arrivalAerodrome: undefined,
        arrivalTime: undefined,
        departureAerodrome: undefined,
        departureTime: undefined,
      };

      const middleware = validationMiddleware(CreateFlightDto);
      await middleware(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Validation failed',
        errors: expect.any(Array),
      });
      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe('error message formatting', () => {
    it('should flatten and format validation errors correctly', async () => {
      mockRequest.body = {
        arrivalAerodrome: 123,
        arrivalTime: 'invalid',
        departureAerodrome: '',
        departureTime: null,
      };

      const middleware = validationMiddleware(CreateFlightDto);
      await middleware(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Validation failed',
        errors: expect.arrayContaining([expect.any(String)]),
      });
    });
  });
});
