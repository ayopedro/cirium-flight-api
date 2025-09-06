# API Reference

## Base URL

```
http://localhost:3000
```

## Authentication

No authentication is currently required. All endpoints are publicly accessible.

## Content Types

- **Request**: `application/json`
- **Response**: `application/json`

## Error Responses

All endpoints return appropriate HTTP status codes and error messages:

```json
{
  "message": "Error description",
  "error": "Detailed error message"
}
```

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

**Status Codes:**

- `200` - Success
- `500` - Internal Server Error

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

- `arrivalAerodrome` (string, required): IATA airport code
- `arrivalTime` (string, required): Valid ISO 8601 date
- `departureAerodrome` (string, required): IATA airport code
- `departureTime` (string, required): Valid ISO 8601 date

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

**Status Codes:**

- `201` - Created
- `400` - Bad Request (validation errors)
- `500` - Internal Server Error

**Validation Errors:**

```json
{
  "message": "Validation failed",
  "errors": [
    "arrivalAerodrome should not be empty",
    "arrivalTime must be a valid ISO 8601 date"
  ]
}
```

---

#### GET /flights/:id/details

Get detailed information about a specific flight.

**Path Parameters:**

- `id` (string, required): Flight ID

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

**Status Codes:**

- `200` - Success
- `400` - Bad Request (flight not found)
- `500` - Internal Server Error

**Error Response:**

```json
{
  "error": "Flight not found"
}
```

---

#### GET /flights/:id/position

Get the current or calculated position of a flight at a specific time.

**Path Parameters:**

- `id` (string, required): Flight ID

**Query Parameters:**

- `time` (string, optional): ISO 8601 date string. If not provided, current time is used.

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

**Status Codes:**

- `200` - Success
- `400` - Bad Request (invalid time format or flight not found)
- `500` - Internal Server Error

**Validation Errors:**

```json
{
  "message": "Validation failed",
  "errors": ["time must be a valid ISO 8601 date"]
}
```

**Error Response:**

```json
{
  "error": "Flight not found"
}
```

---

#### GET /flights/:id/in-airspace

Check if a flight is within a specified airspace at a given time.

**Path Parameters:**

- `id` (string, required): Flight ID

**Query Parameters:**

- `bottomLeftX` (number, required): Bottom-left longitude coordinate
- `bottomLeftY` (number, required): Bottom-left latitude coordinate
- `topRightX` (number, required): Top-right longitude coordinate
- `topRightY` (number, required): Top-right latitude coordinate
- `time` (string, optional): ISO 8601 date string

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

**Status Codes:**

- `200` - Success
- `400` - Bad Request (missing coordinates, invalid time format, or flight not found)
- `500` - Internal Server Error

**Error Responses:**

```json
{
  "error": "Airspace coordinates are required"
}
```

```json
{
  "message": "Validation failed",
  "errors": ["time must be a valid ISO 8601 date"]
}
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

**Status Codes:**

- `200` - Success
- `500` - Internal Server Error

---

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

### FlightRecord

```typescript
interface FlightRecord {
  id: string;
  arrivalAerodrome: string;
  arrivalTime: string;
  departureAerodrome: string;
  departureTime: string;
}
```

---

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

### Haversine Formula

The API uses the Haversine formula to calculate great-circle distances between two points on Earth:

```
a = sin²(Δφ/2) + cos φ1 ⋅ cos φ2 ⋅ sin²(Δλ/2)
c = 2 ⋅ atan2( √a, √(1−a) )
d = R ⋅ c
```

Where:

- φ is latitude
- λ is longitude
- R is Earth's radius (≈ 6371 km)

---

## Error Handling

### HTTP Status Codes

| Code | Description                             |
| ---- | --------------------------------------- |
| 200  | OK - Request successful                 |
| 201  | Created - Resource created successfully |
| 400  | Bad Request - Invalid request data      |
| 404  | Not Found - Resource not found          |
| 500  | Internal Server Error - Server error    |

### Error Response Format

```typescript
interface ErrorResponse {
  message: string;
  error?: string;
  errors?: string[];
}
```

### Common Error Scenarios

#### Validation Errors

```json
{
  "message": "Validation failed",
  "errors": [
    "arrivalAerodrome should not be empty",
    "arrivalTime must be a valid ISO 8601 date",
    "departureAerodrome should not be empty",
    "departureTime must be a valid ISO 8601 date"
  ]
}
```

#### Service Errors

```json
{
  "message": "Database connection failed",
  "error": "Connection timeout"
}
```

#### Not Found Errors

```json
{
  "error": "Flight not found"
}
```

#### Geographic Errors

```json
{
  "error": "Invalid airspace longitude range"
}
```

---

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

# Response:
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

# 2. Get flight details
curl -X GET http://localhost:3000/flights/1/details

# Response:
{
  "message": "Successfully fetched flight data",
  "data": {
    "arrivalAerodrome": "LAX",
    "arrivalTime": "2024-01-01T12:00:00Z",
    "departureAerodrome": "JFK",
    "departureTime": "2024-01-01T10:00:00Z"
  }
}

# 3. Check position at different times
curl -X GET "http://localhost:3000/flights/1/position?time=2024-01-01T09:30:00Z"
# Response: Returns JFK coordinates (before departure)

curl -X GET "http://localhost:3000/flights/1/position?time=2024-01-01T11:00:00Z"
# Response: Returns interpolated position (mid-flight)

curl -X GET "http://localhost:3000/flights/1/position?time=2024-01-01T12:30:00Z"
# Response: Returns LAX coordinates (after arrival)

# 4. Check airspace
curl -X GET "http://localhost:3000/flights/1/in-airspace?bottomLeftX=-120&bottomLeftY=30&topRightX=-110&topRightY=40&time=2024-01-01T11:00:00Z"

# Response:
{
  "message": "Airspace information fetched successfully",
  "data": {
    "isInAirspace": true
  }
}
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

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  async getFlightPosition(flightId: string, time?: string) {
    const url = time
      ? `${this.baseUrl}/flights/${flightId}/position?time=${time}`
      : `${this.baseUrl}/flights/${flightId}/position`;

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

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

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  async getAirports() {
    const response = await fetch(`${this.baseUrl}/flights/airports`);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }
}

// Usage
const tracker = new FlightTracker();

try {
  // Create flight
  const flight = await tracker.createFlight({
    arrivalAerodrome: 'LAX',
    arrivalTime: '2024-01-01T12:00:00Z',
    departureAerodrome: 'JFK',
    departureTime: '2024-01-01T10:00:00Z',
  });

  console.log('Flight created:', flight.data.id);

  // Track position
  const position = await tracker.getFlightPosition(
    flight.data.id,
    '2024-01-01T11:00:00Z'
  );
  console.log('Flight position:', position.data);

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

  console.log('In airspace:', airspaceCheck.data.isInAirspace);
} catch (error) {
  console.error('Error:', error.message);
}
```

### Python Integration

```python
import requests
import json
from typing import Optional, Dict, Any

class FlightTracker:
    def __init__(self, base_url: str = "http://localhost:3000"):
        self.base_url = base_url
        self.session = requests.Session()

    def create_flight(self, flight_data: Dict[str, str]) -> Dict[str, Any]:
        response = self.session.post(
            f"{self.base_url}/flights",
            json=flight_data
        )
        response.raise_for_status()
        return response.json()

    def get_flight_position(self, flight_id: str, time: Optional[str] = None) -> Dict[str, Any]:
        url = f"{self.base_url}/flights/{flight_id}/position"
        params = {"time": time} if time else {}

        response = self.session.get(url, params=params)
        response.raise_for_status()
        return response.json()

    def check_airspace(self, flight_id: str, airspace: Dict[str, float], time: Optional[str] = None) -> Dict[str, Any]:
        url = f"{self.base_url}/flights/{flight_id}/in-airspace"
        params = {**airspace}
        if time:
            params["time"] = time

        response = self.session.get(url, params=params)
        response.raise_for_status()
        return response.json()

    def get_airports(self) -> Dict[str, Any]:
        response = self.session.get(f"{self.base_url}/flights/airports")
        response.raise_for_status()
        return response.json()

# Usage
tracker = FlightTracker()

try:
    # Create flight
    flight = tracker.create_flight({
        "arrivalAerodrome": "LAX",
        "arrivalTime": "2024-01-01T12:00:00Z",
        "departureAerodrome": "JFK",
        "departureTime": "2024-01-01T10:00:00Z"
    })

    print(f"Flight created: {flight['data']['id']}")

    # Track position
    position = tracker.get_flight_position(flight['data']['id'], "2024-01-01T11:00:00Z")
    print(f"Flight position: {position['data']}")

    # Check airspace
    airspace_check = tracker.check_airspace(flight['data']['id'], {
        "bottomLeftX": -120,
        "bottomLeftY": 30,
        "topRightX": -110,
        "topRightY": 40
    }, "2024-01-01T11:00:00Z")

    print(f"In airspace: {airspace_check['data']['isInAirspace']}")

except requests.exceptions.RequestException as e:
    print(f"Error: {e}")
```

---

## Troubleshooting

### Common Issues

1. **Invalid Date Format**: Ensure dates are in ISO 8601 format (e.g., "2024-01-01T12:00:00Z")
2. **Invalid Airport Codes**: Use valid IATA airport codes (e.g., "JFK", "LAX")
3. **Coordinate Range**: Longitude must be -180 to 180, latitude -90 to 90
4. **Database Connection**: Ensure the database server is running
5. **Missing Required Fields**: Check that all required fields are provided

### Debug Mode

Enable debug logging by setting the `NODE_ENV` environment variable to `development`.

### Health Check

Check if the API is running:

```bash
curl http://localhost:3000/health
```

Expected response:

```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T12:00:00.000Z",
  "uptime": 3600
}
```
