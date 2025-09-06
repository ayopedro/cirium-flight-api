import { Flight } from '../../src/models/flight.model';
import { Coordinate } from '../../src/models/coordinate.model';

// Mock the fetch function
global.fetch = jest.fn();

describe('Flight', () => {
  let flight: Flight;
  const departureTime = new Date('2024-01-01T10:00:00Z');
  const arrivalTime = new Date('2024-01-01T12:00:00Z');

  beforeEach(() => {
    flight = new Flight('LAX', arrivalTime, 'JFK', departureTime);
    jest.clearAllMocks();
  });

  describe('constructor', () => {
    it('should create a flight with valid parameters', () => {
      expect(flight.getArrivalAerodrome()).toBe('LAX');
      expect(flight.getArrivalTime()).toBe(arrivalTime);
      expect(flight.getDepartureAerodrome()).toBe('JFK');
      expect(flight.getDepartureTime()).toBe(departureTime);
    });
  });

  describe('getArrivalAerodrome', () => {
    it('should return the arrival aerodrome', () => {
      expect(flight.getArrivalAerodrome()).toBe('LAX');
    });
  });

  describe('getArrivalTime', () => {
    it('should return the arrival time', () => {
      expect(flight.getArrivalTime()).toBe(arrivalTime);
    });
  });

  describe('getDepartureAerodrome', () => {
    it('should return the departure aerodrome', () => {
      expect(flight.getDepartureAerodrome()).toBe('JFK');
    });
  });

  describe('getDepartureTime', () => {
    it('should return the departure time', () => {
      expect(flight.getDepartureTime()).toBe(departureTime);
    });
  });

  describe('getPosition', () => {
    const mockAirportData = [
      { latitude: 40.6413, longitude: -73.7781 }, // JFK
      { latitude: 33.9425, longitude: -118.4081 }, // LAX
    ];

    beforeEach(() => {
      (fetch as jest.Mock).mockImplementation((url: string) => {
        if (url.includes('iata=JFK')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve([mockAirportData[0]]),
          });
        } else if (url.includes('iata=LAX')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve([mockAirportData[1]]),
          });
        }
        return Promise.reject(new Error('Unknown airport'));
      });
    });

    it('should return departure position when time is before departure', async () => {
      const beforeDeparture = new Date('2024-01-01T09:00:00Z');
      const position = await flight.getPosition(beforeDeparture);

      expect(position.getX()).toBe(-73.7781); // JFK longitude
      expect(position.getY()).toBe(40.6413); // JFK latitude
    });

    it('should return arrival position when time is after arrival', async () => {
      const afterArrival = new Date('2024-01-01T13:00:00Z');
      const position = await flight.getPosition(afterArrival);

      expect(position.getX()).toBe(-118.4081); // LAX longitude
      expect(position.getY()).toBe(33.9425); // LAX latitude
    });

    it('should return departure position when time equals departure time', async () => {
      const position = await flight.getPosition(departureTime);

      expect(position.getX()).toBe(-73.7781); // JFK longitude
      expect(position.getY()).toBe(40.6413); // JFK latitude
    });

    it('should return arrival position when time equals arrival time', async () => {
      const position = await flight.getPosition(arrivalTime);

      expect(position.getX()).toBe(-118.4081); // LAX longitude
      expect(position.getY()).toBe(33.9425); // LAX latitude
    });

    it('should calculate intermediate position during flight', async () => {
      const midFlight = new Date('2024-01-01T11:00:00Z'); // halfway through
      const position = await flight.getPosition(midFlight);

      // Should be somewhere between JFK and LAX
      expect(position.getX()).toBeGreaterThan(-118.4081); // west of LAX
      expect(position.getX()).toBeLessThan(-73.7781); // east of JFK
      expect(position.getY()).toBeGreaterThan(33.9425); // north of LAX
      expect(position.getY()).toBeLessThan(40.6413); // south of JFK
    });

    it('should use current time when no time is provided', async () => {
      const mockDate = new Date('2024-01-01T11:30:00Z');
      jest.spyOn(global, 'Date').mockImplementation(() => mockDate as any);

      const position = await flight.getPosition();

      expect(position).toBeDefined();
      expect(position.getX()).toBeDefined();
      expect(position.getY()).toBeDefined();
    });

    it('should throw error when aerodrome is not found', async () => {
      (fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 404,
      });

      await expect(flight.getPosition()).rejects.toThrow(
        'Aerodrome JFK not found'
      );
    });

    it('should throw error when airport data is empty', async () => {
      (fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve([]),
      });

      await expect(flight.getPosition()).rejects.toThrow(
        'Aerodrome JFK not found'
      );
    });

    it('should throw error when coordinates are unknown', async () => {
      (fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve([null]), // Return null instead of object with null values
      });

      await expect(flight.getPosition()).rejects.toThrow(
        'Aerodrome JFK not found'
      );
    });
  });
});
