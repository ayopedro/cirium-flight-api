# Quick Start Guide

Get up and running with the Cirium Task API in minutes!

## Prerequisites

- Node.js 16+ installed
- npm or yarn package manager
- Git

## Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd cirium-task
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Start the database server**

   ```bash
   npm run dev:db
   ```

4. **Start the application**
   ```bash
   npm run dev
   ```

The API will be available at `http://localhost:3000`

## Quick Test

### 1. Create a Flight

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

**Expected Response:**

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

### 2. Get Flight Position

```bash
curl "http://localhost:3000/flights/1/position?time=2024-01-01T11:00:00Z"
```

**Expected Response:**

```json
{
  "message": "Flight position fetched successfully",
  "data": {
    "x": -100.1234,
    "y": 40.5678
  }
}
```

### 3. Check Airspace

```bash
curl "http://localhost:3000/flights/1/in-airspace?bottomLeftX=-120&bottomLeftY=30&topRightX=-110&topRightY=40"
```

**Expected Response:**

```json
{
  "message": "Airspace information fetched successfully",
  "data": {
    "isInAirspace": true
  }
}
```

## Available Endpoints

| Method | Endpoint                   | Description                    |
| ------ | -------------------------- | ------------------------------ |
| GET    | `/flights`                 | Get all flights                |
| POST   | `/flights`                 | Create a new flight            |
| GET    | `/flights/:id/details`     | Get flight details             |
| GET    | `/flights/:id/position`    | Get flight position            |
| GET    | `/flights/:id/in-airspace` | Check if flight is in airspace |
| GET    | `/flights/airports`        | Get all airports               |

## Next Steps

1. **Read the full documentation**: [README.md](../README.md)
2. **Explore the API**: [API Reference](API_REFERENCE.md)
3. **Learn about development**: [Development Guide](DEVELOPMENT.md)
4. **Deploy to production**: [Deployment Guide](DEPLOYMENT.md)

## Troubleshooting

### Common Issues

1. **Port already in use**

   ```bash
   # Find process using port 3000
   lsof -i :3000

   # Kill the process
   kill -9 <PID>
   ```

2. **Database not running**

   ```bash
   # Start database server
   npm run dev:db
   ```

3. **Dependencies not installed**
   ```bash
   # Install dependencies
   npm install
   ```

### Getting Help

- Check the [API Reference](API_REFERENCE.md) for detailed endpoint documentation
- Review the [Development Guide](DEVELOPMENT.md) for technical details
- Look at the test files in the `test/` directory for usage examples

## Example Applications

### JavaScript/TypeScript

```typescript
// Create a flight tracker
const tracker = new FlightTracker('http://localhost:3000');

// Create a flight
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
console.log('Position:', position.data);
```

### Python

```python
import requests

# Create a flight
response = requests.post('http://localhost:3000/flights', json={
    'arrivalAerodrome': 'LAX',
    'arrivalTime': '2024-01-01T12:00:00Z',
    'departureAerodrome': 'JFK',
    'departureTime': '2024-01-01T10:00:00Z'
})

flight = response.json()
print('Flight created:', flight['data']['id'])

# Get position
position = requests.get(f"http://localhost:3000/flights/{flight['data']['id']}/position?time=2024-01-01T11:00:00Z")
print('Position:', position.json()['data'])
```

### cURL

```bash
# Create flight
FLIGHT_ID=$(curl -s -X POST http://localhost:3000/flights \
  -H "Content-Type: application/json" \
  -d '{"arrivalAerodrome":"LAX","arrivalTime":"2024-01-01T12:00:00Z","departureAerodrome":"JFK","departureTime":"2024-01-01T10:00:00Z"}' \
  | jq -r '.data.id')

# Get position
curl "http://localhost:3000/flights/$FLIGHT_ID/position?time=2024-01-01T11:00:00Z"
```

## Testing

Run the test suite to verify everything is working:

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch
```

## Production Deployment

For production deployment, see the [Deployment Guide](DEPLOYMENT.md).

## Support

If you encounter any issues:

1. Check the troubleshooting section above
2. Review the full documentation
3. Check the test files for examples
4. Create an issue in the repository
