import { FlightService } from '../../src/services/flight.service';
import { CreateFlightDto } from '../../src/services/dto/create-flight.dto';
import { GetPositionDto } from '../../src/services/dto/get-position.dto';
import { DbService } from '../../src/db/db.service';
import { Flight } from '../../src/models/flight.model';
import { Coordinate } from '../../src/models/coordinate.model';

// Mock the DbService
jest.mock('../../src/db/db.service');
const MockedDbService = DbService as jest.Mocked<typeof DbService>;

// Mock the Flight model
jest.mock('../../src/models/flight.model');
const MockedFlight = Flight as jest.MockedClass<typeof Flight>;

describe('FlightService', () => {
  let flightService: FlightService;

  beforeEach(() => {
    flightService = new FlightService();
    jest.clearAllMocks();
  });

  describe('createFlight', () => {
    it('should create a flight successfully', async () => {
      const createFlightDto: CreateFlightDto = {
        arrivalAerodrome: 'LAX',
        arrivalTime: '2024-01-01T12:00:00Z',
        departureAerodrome: 'JFK',
        departureTime: '2024-01-01T10:00:00Z',
      };

      const mockResponse = { id: '1', ...createFlightDto };
      MockedDbService.post.mockResolvedValue(mockResponse);

      const result = await flightService.createFlight(createFlightDto);

      expect(MockedDbService.post).toHaveBeenCalledWith(
        'flights',
        createFlightDto
      );
      expect(result).toEqual(mockResponse);
    });

    it('should handle database errors', async () => {
      const createFlightDto: CreateFlightDto = {
        arrivalAerodrome: 'LAX',
        arrivalTime: '2024-01-01T12:00:00Z',
        departureAerodrome: 'JFK',
        departureTime: '2024-01-01T10:00:00Z',
      };

      const error = new Error('Database connection failed');
      MockedDbService.post.mockRejectedValue(error);

      await expect(flightService.createFlight(createFlightDto)).rejects.toThrow(
        'Database connection failed'
      );
    });
  });

  describe('getFlights', () => {
    it('should return all flights', async () => {
      const mockFlights = [
        {
          id: '1',
          arrivalAerodrome: 'LAX',
          arrivalTime: '2024-01-01T12:00:00Z',
          departureAerodrome: 'JFK',
          departureTime: '2024-01-01T10:00:00Z',
        },
        {
          id: '2',
          arrivalAerodrome: 'SFO',
          arrivalTime: '2024-01-01T14:00:00Z',
          departureAerodrome: 'LAX',
          departureTime: '2024-01-01T13:00:00Z',
        },
      ];

      MockedDbService.get.mockResolvedValue(mockFlights);

      const result = await flightService.getFlights();

      expect(MockedDbService.get).toHaveBeenCalledWith('flights');
      expect(result).toEqual(mockFlights);
    });

    it('should handle database errors', async () => {
      const error = new Error('Database connection failed');
      MockedDbService.get.mockRejectedValue(error);

      await expect(flightService.getFlights()).rejects.toThrow(
        'Database connection failed'
      );
    });
  });

  describe('getFlight', () => {
    it('should return a flight by id', async () => {
      const flightId = '1';
      const mockFlightData = {
        id: flightId,
        arrivalAerodrome: 'LAX',
        arrivalTime: '2024-01-01T12:00:00Z',
        departureAerodrome: 'JFK',
        departureTime: '2024-01-01T10:00:00Z',
      };

      const mockFlightInstance = {
        getArrivalAerodrome: jest.fn().mockReturnValue('LAX'),
        getArrivalTime: jest
          .fn()
          .mockReturnValue(new Date('2024-01-01T12:00:00Z')),
        getDepartureAerodrome: jest.fn().mockReturnValue('JFK'),
        getDepartureTime: jest
          .fn()
          .mockReturnValue(new Date('2024-01-01T10:00:00Z')),
      };

      MockedDbService.get.mockResolvedValue(mockFlightData);
      MockedFlight.mockImplementation(() => mockFlightInstance as any);

      const result = await flightService.getFlight(flightId);

      expect(MockedDbService.get).toHaveBeenCalledWith(`/flights/${flightId}`);
      expect(MockedFlight).toHaveBeenCalledWith(
        'LAX',
        new Date('2024-01-01T12:00:00Z'),
        'JFK',
        new Date('2024-01-01T10:00:00Z')
      );
      expect(result).toBe(mockFlightInstance);
    });

    it('should handle database errors', async () => {
      const flightId = '1';
      const error = new Error('Flight not found');
      MockedDbService.get.mockRejectedValue(error);

      await expect(flightService.getFlight(flightId)).rejects.toThrow(
        'Flight not found'
      );
    });
  });

  describe('getAirports', () => {
    it('should return airports', async () => {
      const mockAirports = [
        { iata: 'JFK', name: 'John F. Kennedy International Airport' },
        { iata: 'LAX', name: 'Los Angeles International Airport' },
      ];

      MockedDbService.get.mockResolvedValue(mockAirports);

      const result = await flightService.getAirports();

      expect(MockedDbService.get).toHaveBeenCalledWith('airports');
      expect(result).toEqual(mockAirports);
    });

    it('should handle database errors', async () => {
      const error = new Error('Database connection failed');
      MockedDbService.get.mockRejectedValue(error);

      await expect(flightService.getAirports()).rejects.toThrow(
        'Database connection failed'
      );
    });
  });

  describe('getFlightPosition', () => {
    it('should return flight position at specific time', async () => {
      const flightId = '1';
      const getPositionDto: GetPositionDto = {
        time: '2024-01-01T11:00:00Z',
      };

      const mockFlightInstance = {
        getPosition: jest.fn().mockResolvedValue(new Coordinate(-100, 40)),
      };

      const mockFlightData = {
        id: flightId,
        arrivalAerodrome: 'LAX',
        arrivalTime: '2024-01-01T12:00:00Z',
        departureAerodrome: 'JFK',
        departureTime: '2024-01-01T10:00:00Z',
      };

      MockedDbService.get.mockResolvedValue(mockFlightData);
      MockedFlight.mockImplementation(() => mockFlightInstance as any);

      const result = await flightService.getFlightPosition(
        flightId,
        getPositionDto
      );

      expect(mockFlightInstance.getPosition).toHaveBeenCalledWith(
        new Date('2024-01-01T11:00:00Z')
      );
      expect(result).toEqual(new Coordinate(-100, 40));
    });

    it('should use current time when no time is provided', async () => {
      const flightId = '1';
      const getPositionDto: GetPositionDto = {};

      const mockFlightInstance = {
        getPosition: jest.fn().mockResolvedValue(new Coordinate(-100, 40)),
      };

      const mockFlightData = {
        id: flightId,
        arrivalAerodrome: 'LAX',
        arrivalTime: '2024-01-01T12:00:00Z',
        departureAerodrome: 'JFK',
        departureTime: '2024-01-01T10:00:00Z',
      };

      MockedDbService.get.mockResolvedValue(mockFlightData);
      MockedFlight.mockImplementation(() => mockFlightInstance as any);

      const mockDate = new Date('2024-01-01T11:30:00Z');
      jest.spyOn(global, 'Date').mockImplementation(() => mockDate as any);

      const result = await flightService.getFlightPosition(
        flightId,
        getPositionDto
      );

      expect(mockFlightInstance.getPosition).toHaveBeenCalledWith(mockDate);
      expect(result).toEqual(new Coordinate(-100, 40));
    });

    it('should handle flight not found error', async () => {
      const flightId = '1';
      const getPositionDto: GetPositionDto = {};

      const error = new Error('Flight not found');
      MockedDbService.get.mockRejectedValue(error);

      await expect(
        flightService.getFlightPosition(flightId, getPositionDto)
      ).rejects.toThrow('Flight not found');
    });

    it('should handle position calculation error', async () => {
      const flightId = '1';
      const getPositionDto: GetPositionDto = {};

      const mockFlightInstance = {
        getPosition: jest
          .fn()
          .mockRejectedValue(new Error('Position calculation failed')),
      };

      const mockFlightData = {
        id: flightId,
        arrivalAerodrome: 'LAX',
        arrivalTime: '2024-01-01T12:00:00Z',
        departureAerodrome: 'JFK',
        departureTime: '2024-01-01T10:00:00Z',
      };

      MockedDbService.get.mockResolvedValue(mockFlightData);
      MockedFlight.mockImplementation(() => mockFlightInstance as any);

      await expect(
        flightService.getFlightPosition(flightId, getPositionDto)
      ).rejects.toThrow('Position calculation failed');
    });
  });

  describe('isFlightInAirspace', () => {
    it('should return true when flight is in airspace', async () => {
      const flightId = '1';
      const getPositionDto: GetPositionDto = {};
      const bottomLeftX = -10;
      const bottomLeftY = -10;
      const topRightX = 10;
      const topRightY = 10;

      const mockFlightInstance = {
        getPosition: jest.fn().mockResolvedValue(new Coordinate(0, 0)), // Center of airspace
      };

      const mockFlightData = {
        id: flightId,
        arrivalAerodrome: 'LAX',
        arrivalTime: '2024-01-01T12:00:00Z',
        departureAerodrome: 'JFK',
        departureTime: '2024-01-01T10:00:00Z',
      };

      MockedDbService.get.mockResolvedValue(mockFlightData);
      MockedFlight.mockImplementation(() => mockFlightInstance as any);

      const result = await flightService.isFlightInAirspace(
        flightId,
        bottomLeftX,
        bottomLeftY,
        topRightX,
        topRightY,
        getPositionDto
      );

      expect(result).toBe(true);
    });

    it('should return false when flight is outside airspace', async () => {
      const flightId = '1';
      const getPositionDto: GetPositionDto = {};
      const bottomLeftX = -10;
      const bottomLeftY = -10;
      const topRightX = 10;
      const topRightY = 10;

      const mockFlightInstance = {
        getPosition: jest.fn().mockResolvedValue(new Coordinate(20, 20)), // Outside airspace
      };

      const mockFlightData = {
        id: flightId,
        arrivalAerodrome: 'LAX',
        arrivalTime: '2024-01-01T12:00:00Z',
        departureAerodrome: 'JFK',
        departureTime: '2024-01-01T10:00:00Z',
      };

      MockedDbService.get.mockResolvedValue(mockFlightData);
      MockedFlight.mockImplementation(() => mockFlightInstance as any);

      const result = await flightService.isFlightInAirspace(
        flightId,
        bottomLeftX,
        bottomLeftY,
        topRightX,
        topRightY,
        getPositionDto
      );

      expect(result).toBe(false);
    });

    it('should handle flight not found error', async () => {
      const flightId = '1';
      const getPositionDto: GetPositionDto = {};

      const error = new Error('Flight not found');
      MockedDbService.get.mockRejectedValue(error);

      await expect(
        flightService.isFlightInAirspace(
          flightId,
          -10,
          -10,
          10,
          10,
          getPositionDto
        )
      ).rejects.toThrow('Flight not found');
    });

    it('should handle position calculation error', async () => {
      const flightId = '1';
      const getPositionDto: GetPositionDto = {};

      const mockFlightInstance = {
        getPosition: jest
          .fn()
          .mockRejectedValue(new Error('Position calculation failed')),
      };

      const mockFlightData = {
        id: flightId,
        arrivalAerodrome: 'LAX',
        arrivalTime: '2024-01-01T12:00:00Z',
        departureAerodrome: 'JFK',
        departureTime: '2024-01-01T10:00:00Z',
      };

      MockedDbService.get.mockResolvedValue(mockFlightData);
      MockedFlight.mockImplementation(() => mockFlightInstance as any);

      await expect(
        flightService.isFlightInAirspace(
          flightId,
          -10,
          -10,
          10,
          10,
          getPositionDto
        )
      ).rejects.toThrow('Position calculation failed');
    });
  });
});
