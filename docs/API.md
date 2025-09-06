# API Documentation

## Overview

The Cirium Task API provides comprehensive flight tracking and management capabilities. This document provides detailed information about all available endpoints, request/response formats, and usage examples.

## Base URL

```
http://localhost:3000
```

## Authentication

Currently, no authentication is required. All endpoints are publicly accessible.

## Content Types

- **Request**: `application/json`
- **Response**: `application/json`

## Error Handling

All endpoints return appropriate HTTP status codes and error messages in the following format:

```json
{
  "message": "Error description",
  "error": "Detailed error message"
}
```

### HTTP Status Codes

| Code | Description                             |
| ---- | --------------------------------------- |
| 200  | OK - Request successful                 |
| 201  | Created - Resource created successfully |
| 400  | Bad Request - Invalid request data      |
| 404  | Not Found - Resource not found          |
| 500  | Internal Server Error - Server error    |

## Endpoints

### Flights

#### GET /flights

Retrieve all flights in the system.

**Response:**

```json
{
  "message": "Successfully fetched all flights",
  "data": [
    {
      "id": "1",
      "arrivalAerodrome": "LAX",
      "arrivalTime": "2024-01-01T12:00:00Z",
      "departureAerodrome": "JFK",
      "departureTime": "2024-01-01T10:00:00Z"
    }
  ]
}
```

**Example:**

```bash
curl -X GET http://localhost:3000/flights
```

---

#### POST /flights

Create a new flight record.

**Request Body:**

```json
{
  "arrivalAerodrome": "LAX",
  "arrivalTime": "2024-01-01T12:00:00Z",
  "departureAerodrome": "JFK",
  "departureTime": "2024-01-01T10:00:00Z"
}
```

**Validation Rules:**

- `arrivalAerodrome`: Required string, IATA airport code
- `arrivalTime`: Required string, valid ISO 8601 date
- `departureAerodrome`: Required string, IATA airport code
- `departureTime`: Required string, valid ISO 8601 date

**Response:**

```json
{
  "message": "Successfully created flight",
  "data": {
    "id": "1",
    "arrivalAerodrome": "LAX",
    "arrivalTime": "2024-01-01T12:00:00Z",
    "departureAerodrome": "JFK",
    "departureTime": "2024-01-01T10:00:00Z"
  }
}
```

**Example:**

```bash
curl -X POST http://localhost:3000/flights \
  -H "Content-Type: application/json" \
  -d '{
    "arrivalAerodrome": "LAX",
    "arrivalTime": "2024-01-01T12:00:00Z",
    "departureAerodrome": "JFK",
    "departureTime": "2024-01-01T10:00:00Z"
  }'
```

---

#### GET /flights/:id/details

Get detailed information about a specific flight.

**Path Parameters:**

- `id`: Flight ID (string)

**Response:**

```json
{
  "message": "Successfully fetched flight data",
  "data": {
    "arrivalAerodrome": "LAX",
    "arrivalTime": "2024-01-01T12:00:00Z",
    "departureAerodrome": "JFK",
    "departureTime": "2024-01-01T10:00:00Z"
  }
}
```

**Example:**

```bash
curl -X GET http://localhost:3000/flights/1/details
```

---

#### GET /flights/:id/position

Get the current or calculated position of a flight at a specific time.

**Path Parameters:**

- `id`: Flight ID (string)

**Query Parameters:**

- `time` (optional): ISO 8601 date string. If not provided, current time is used.

**Response:**

```json
{
  "message": "Flight position fetched successfully",
  "data": {
    "x": -100.1234,
    "y": 40.5678
  }
}
```

**Position Calculation:**

- If time is before departure: returns departure airport coordinates
- If time is after arrival: returns arrival airport coordinates
- If time is during flight: calculates interpolated position based on flight progress

**Example:**

```bash
# Get current position
curl -X GET http://localhost:3000/flights/1/position

# Get position at specific time
curl -X GET "http://localhost:3000/flights/1/position?time=2024-01-01T11:00:00Z"
```

---

#### GET /flights/:id/in-airspace

Check if a flight is within a specified airspace at a given time.

**Path Parameters:**

- `id`: Flight ID (string)

**Query Parameters:**

- `bottomLeftX`: Bottom-left longitude coordinate (number)
- `bottomLeftY`: Bottom-left latitude coordinate (number)
- `topRightX`: Top-right longitude coordinate (number)
- `topRightY`: Top-right latitude coordinate (number)
- `time` (optional): ISO 8601 date string

**Response:**

```json
{
  "message": "Airspace information fetched successfully",
  "data": {
    "isInAirspace": true
  }
}
```

**Airspace Definition:**
The airspace is defined as a rectangular area with:

- Bottom-left corner: `(bottomLeftX, bottomLeftY)`
- Top-right corner: `(topRightX, topRightY)`

**Example:**

```bash
curl -X GET "http://localhost:3000/flights/1/in-airspace?bottomLeftX=-10&bottomLeftY=-10&topRightX=10&topRightY=10&time=2024-01-01T11:00:00Z"
```

---

### Airports

#### GET /flights/airports

Get all available airports in the system.

**Response:**

```json
{
  "message": "Successfully fetched airports",
  "data": [
    {
      "iata": "JFK",
      "name": "John F. Kennedy International Airport",
      "latitude": 40.6413,
      "longitude": -73.7781
    },
    {
      "iata": "LAX",
      "name": "Los Angeles International Airport",
      "latitude": 33.9425,
      "longitude": -118.4081
    }
  ]
}
```

**Example:**

```bash
curl -X GET http://localhost:3000/flights/airports
```

## Data Models

### Flight

```typescript
interface Flight {
  id: string;
  arrivalAerodrome: string;
  arrivalTime: string; // ISO 8601 date
  departureAerodrome: string;
  departureTime: string; // ISO 8601 date
}
```

### Coordinate

```typescript
interface Coordinate {
  x: number; // Longitude (-180 to 180)
  y: number; // Latitude (-90 to 90)
}
```

### Airport

```typescript
interface Airport {
  iata: string;
  name: string;
  latitude: number;
  longitude: number;
}
```

## Geographic Calculations

### Position Interpolation

The API calculates flight positions using geographic interpolation:

1. **Before Departure**: Returns departure airport coordinates
2. **After Arrival**: Returns arrival airport coordinates
3. **During Flight**: Calculates position based on:
   - Flight progress percentage
   - Great circle distance between airports
   - Bearing from departure to arrival
   - Haversine formula for distance calculations

### Coordinate System

- **Longitude (X)**: -180 to +180 degrees
- **Latitude (Y)**: -90 to +90 degrees
- **Distance**: Calculated in kilometers
- **Bearing**: 0-360 degrees from north

## Error Responses

### Validation Errors

```json
{
  "message": "Validation failed",
  "errors": [
    "arrivalAerodrome should not be empty",
    "arrivalTime must be a valid ISO 8601 date"
  ]
}
```

### Service Errors

```json
{
  "message": "Database connection failed",
  "error": "Connection timeout"
}
```

### Not Found Errors

```json
{
  "error": "Flight not found"
}
```

## Rate Limiting

Currently, no rate limiting is implemented. Consider implementing rate limiting for production use.

## CORS

CORS is not configured. Add CORS middleware for cross-origin requests if needed.

## Examples

### Complete Flight Tracking Workflow

```bash
# 1. Create a flight
curl -X POST http://localhost:3000/flights \
  -H "Content-Type: application/json" \
  -d '{
    "arrivalAerodrome": "LAX",
    "arrivalTime": "2024-01-01T12:00:00Z",
    "departureAerodrome": "JFK",
    "departureTime": "2024-01-01T10:00:00Z"
  }'

# 2. Get flight details
curl -X GET http://localhost:3000/flights/1/details

# 3. Check position at different times
curl -X GET "http://localhost:3000/flights/1/position?time=2024-01-01T09:30:00Z" # Before departure
curl -X GET "http://localhost:3000/flights/1/position?time=2024-01-01T11:00:00Z" # Mid-flight
curl -X GET "http://localhost:3000/flights/1/position?time=2024-01-01T12:30:00Z" # After arrival

# 4. Check airspace
curl -X GET "http://localhost:3000/flights/1/in-airspace?bottomLeftX=-120&bottomLeftY=30&topRightX=-110&topRightY=40&time=2024-01-01T11:00:00Z"
```

### JavaScript/TypeScript Integration

```typescript
class FlightTracker {
  private baseUrl: string;

  constructor(baseUrl: string = 'http://localhost:3000') {
    this.baseUrl = baseUrl;
  }

  async createFlight(flightData: {
    arrivalAerodrome: string;
    arrivalTime: string;
    departureAerodrome: string;
    departureTime: string;
  }) {
    const response = await fetch(`${this.baseUrl}/flights`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(flightData),
    });
    return response.json();
  }

  async getFlightPosition(flightId: string, time?: string) {
    const url = time
      ? `${this.baseUrl}/flights/${flightId}/position?time=${time}`
      : `${this.baseUrl}/flights/${flightId}/position`;

    const response = await fetch(url);
    return response.json();
  }

  async checkAirspace(
    flightId: string,
    airspace: {
      bottomLeftX: number;
      bottomLeftY: number;
      topRightX: number;
      topRightY: number;
    },
    time?: string
  ) {
    const params = new URLSearchParams({
      bottomLeftX: airspace.bottomLeftX.toString(),
      bottomLeftY: airspace.bottomLeftY.toString(),
      topRightX: airspace.topRightX.toString(),
      topRightY: airspace.topRightY.toString(),
      ...(time && { time }),
    });

    const response = await fetch(
      `${this.baseUrl}/flights/${flightId}/in-airspace?${params}`
    );
    return response.json();
  }
}

// Usage
const tracker = new FlightTracker();

// Create flight
const flight = await tracker.createFlight({
  arrivalAerodrome: 'LAX',
  arrivalTime: '2024-01-01T12:00:00Z',
  departureAerodrome: 'JFK',
  departureTime: '2024-01-01T10:00:00Z',
});

// Track position
const position = await tracker.getFlightPosition(
  flight.data.id,
  '2024-01-01T11:00:00Z'
);

// Check airspace
const airspaceCheck = await tracker.checkAirspace(
  flight.data.id,
  {
    bottomLeftX: -120,
    bottomLeftY: 30,
    topRightX: -110,
    topRightY: 40,
  },
  '2024-01-01T11:00:00Z'
);
```

## Troubleshooting

### Common Issues

1. **Invalid Date Format**: Ensure dates are in ISO 8601 format
2. **Invalid Airport Codes**: Use valid IATA airport codes
3. **Coordinate Range**: Longitude must be -180 to 180, latitude -90 to 90
4. **Database Connection**: Ensure the database server is running

### Debug Mode

Enable debug logging by setting the `NODE_ENV` environment variable to `development`.

## Changelog

### Version 1.0.0

- Initial API release
- Flight management endpoints
- Position calculation service
- Airspace monitoring
- Airport data access
