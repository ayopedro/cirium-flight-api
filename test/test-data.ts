// Test data for use across test files

export const mockFlightData = {
  valid: {
    arrivalAerodrome: 'LAX',
    arrivalTime: '2024-01-01T12:00:00Z',
    departureAerodrome: 'JFK',
    departureTime: '2024-01-01T10:00:00Z',
  },
  invalid: {
    arrivalAerodrome: '',
    arrivalTime: 'invalid-date',
    departureAerodrome: 'JFK',
    departureTime: '2024-01-01T10:00:00Z',
  },
  incomplete: {
    arrivalAerodrome: 'LAX',
    // Missing other required fields
  },
};

export const mockFlightRecord = {
  id: '1',
  arrivalAerodrome: 'LAX',
  arrivalTime: '2024-01-01T12:00:00Z',
  departureAerodrome: 'JFK',
  departureTime: '2024-01-01T10:00:00Z',
};

export const mockAirportData = [
  {
    iata: 'JFK',
    name: 'John F. Kennedy International Airport',
    latitude: 40.6413,
    longitude: -73.7781,
  },
  {
    iata: 'LAX',
    name: 'Los Angeles International Airport',
    latitude: 33.9425,
    longitude: -118.4081,
  },
  {
    iata: 'SFO',
    name: 'San Francisco International Airport',
    latitude: 37.6213,
    longitude: -122.379,
  },
];

export const mockCoordinates = {
  jfk: { x: -73.7781, y: 40.6413 },
  lax: { x: -118.4081, y: 33.9425 },
  sfo: { x: -122.379, y: 37.6213 },
  center: { x: 0, y: 0 },
  outside: { x: 20, y: 20 },
};

export const mockAirspace = {
  small: {
    bottomLeft: { x: -10, y: -10 },
    topRight: { x: 10, y: 10 },
  },
  large: {
    bottomLeft: { x: -180, y: -90 },
    topRight: { x: 180, y: 90 },
  },
  antimeridian: {
    bottomLeft: { x: 170, y: -10 },
    topRight: { x: -170, y: 10 },
  },
};

export const mockDates = {
  past: new Date('2023-01-01T10:00:00Z'),
  present: new Date('2024-01-01T11:00:00Z'),
  future: new Date('2025-01-01T12:00:00Z'),
  departure: new Date('2024-01-01T10:00:00Z'),
  arrival: new Date('2024-01-01T12:00:00Z'),
  midFlight: new Date('2024-01-01T11:00:00Z'),
};
