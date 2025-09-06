import { Request, Response, NextFunction } from 'express';
import { queryValidationMiddleware } from '../../src/middlewares/query-validator.middleware';
import { GetPositionDto } from '../../src/services/dto/get-position.dto';

describe('queryValidationMiddleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockRequest = {
      query: {},
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    mockNext = jest.fn();
  });

  describe('with valid query parameters', () => {
    it('should call next() when validation passes with valid date', async () => {
      mockRequest.query = {
        time: '2024-01-01T12:00:00Z',
      };

      const middleware = queryValidationMiddleware(GetPositionDto);
      await middleware(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalled();
      expect(mockResponse.status).not.toHaveBeenCalled();
      expect(mockResponse.json).not.toHaveBeenCalled();
    });

    it('should call next() when no query parameters are provided (all optional)', async () => {
      mockRequest.query = {};

      const middleware = queryValidationMiddleware(GetPositionDto);
      await middleware(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalled();
      expect(mockResponse.status).not.toHaveBeenCalled();
      expect(mockResponse.json).not.toHaveBeenCalled();
    });

    it('should call next() when time is undefined', async () => {
      mockRequest.query = {
        time: undefined,
      };

      const middleware = queryValidationMiddleware(GetPositionDto);
      await middleware(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalled();
      expect(mockResponse.status).not.toHaveBeenCalled();
      expect(mockResponse.json).not.toHaveBeenCalled();
    });

    it('should return 400 when time is empty string', async () => {
      mockRequest.query = {
        time: '',
      };

      const middleware = queryValidationMiddleware(GetPositionDto);
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

  describe('with invalid query parameters', () => {
    it('should return 400 status when time is not a valid date string', async () => {
      mockRequest.query = {
        time: 'invalid-date',
      };

      const middleware = queryValidationMiddleware(GetPositionDto);
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

    it('should return 400 status when time is not a string', async () => {
      mockRequest.query = {
        time: 123,
      };

      const middleware = queryValidationMiddleware(GetPositionDto);
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

    it('should return 400 status when time is an object', async () => {
      mockRequest.query = {
        time: { date: '2024-01-01' },
      };

      const middleware = queryValidationMiddleware(GetPositionDto);
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

    it('should return 400 status when time is an array', async () => {
      mockRequest.query = {
        time: ['2024-01-01', '2024-01-02'],
      };

      const middleware = queryValidationMiddleware(GetPositionDto);
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

  describe('with valid date formats', () => {
    it('should accept ISO 8601 date strings', async () => {
      const validDates = [
        '2024-01-01T12:00:00Z',
        '2024-01-01T12:00:00.000Z',
        '2024-01-01T12:00:00+00:00',
        '2024-01-01T12:00:00-05:00',
        '2024-01-01',
        '2024-01-01T12:00:00',
      ];

      for (const date of validDates) {
        mockRequest.query = { time: date };
        const middleware = queryValidationMiddleware(GetPositionDto);

        await middleware(
          mockRequest as Request,
          mockResponse as Response,
          mockNext
        );

        expect(mockNext).toHaveBeenCalled();
        expect(mockResponse.status).not.toHaveBeenCalled();

        // Reset mocks for next iteration
        mockNext.mockClear();
        mockResponse.status.mockClear();
        mockResponse.json.mockClear();
      }
    });
  });

  describe('error message formatting', () => {
    it('should flatten and format validation errors correctly', async () => {
      mockRequest.query = {
        time: 'invalid-date',
      };

      const middleware = queryValidationMiddleware(GetPositionDto);
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
