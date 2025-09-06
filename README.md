# Cirium Task - Flight Tracking API

A comprehensive flight tracking API built with Node.js, TypeScript, and Express that provides real-time flight position calculations, airspace monitoring, and flight management capabilities.

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Architecture](#architecture)
- [Quick Start](#quick-start)
- [Installation](#installation)
- [Configuration](#configuration)
- [API Documentation](#api-documentation)
- [Usage Examples](#usage-examples)
- [Testing](#testing)
- [Development](#development)
- [Deployment](#deployment)
- [Documentation](#documentation)
- [Contributing](#contributing)

## Overview

The Cirium Task API is designed to track flights, calculate their real-time positions, and determine if they are within specified airspace boundaries. It uses geographic calculations to interpolate flight positions between departure and arrival airports based on time.

### Key Capabilities

- **Flight Management**: Create, retrieve, and manage flight records
- **Position Calculation**: Calculate real-time flight positions using geographic interpolation
- **Airspace Monitoring**: Check if flights are within specified airspace boundaries
- **Airport Data**: Access airport information and coordinates
- **Geographic Calculations**: Haversine distance, bearing calculations, and destination point calculations

## Features

### ✈️ Flight Operations

- Create new flight records with departure/arrival information
- Retrieve flight details and status
- Calculate real-time flight positions at any given time
- Track flight progress between airports

### 🗺️ Geographic Services

- Haversine distance calculations between coordinates
- Bearing calculations for flight direction
- Destination point calculations for position interpolation
- Antimeridian crossing support for global flights

### 🛡️ Airspace Management

- Define airspace boundaries with coordinates
- Check if flights are within specified airspace
- Support for complex airspace shapes including antimeridian crossing
- Real-time airspace monitoring

### 🔍 Airport Services

- Airport data retrieval by IATA codes
- Coordinate lookup for geographic calculations
- Support for multiple airport databases

## Architecture

### System Components

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Controllers   │    │    Services     │    │     Models      │
│                 │    │                 │    │                 │
│ FlightController│◄──►│  FlightService  │◄──►│     Flight      │
│                 │    │                 │    │   Coordinate    │
│                 │    │                 │    │    Airspace     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Middlewares   │    │   Database      │    │     Utils       │
│                 │    │                 │    │                 │
│   Validation    │    │   DbService     │    │  GeoUtilities   │
│ QueryValidator  │    │                 │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Technology Stack

- **Runtime**: Node.js
- **Language**: TypeScript
- **Framework**: Express.js
- **Validation**: class-validator, class-transformer
- **Testing**: Jest, Supertest
- **Database**: JSON Server (development)

## Quick Start

Get up and running in minutes! See the [Quick Start Guide](docs/QUICK_START.md) for a step-by-step tutorial.

```bash
# Clone and install
git clone <repository-url>
cd cirium-task
npm install

# Start services
npm run dev:db    # Terminal 1
npm run dev       # Terminal 2

# Test the API
curl -X POST http://localhost:3000/flights \
  -H "Content-Type: application/json" \
  -d '{"arrivalAerodrome":"LAX","arrivalTime":"2024-01-01T12:00:00Z","departureAerodrome":"JFK","departureTime":"2024-01-01T10:00:00Z"}'
```

## Installation

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Git

### Setup

1. **Clone the repository**

   ```bash
   git clone git@github.com:ayopedro/cirium-flight-api.git
   cd cirium-task
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   ```bash
   cp .env.example .env
   ```

4. **Configure environment variables**

   ```env
   APP_PORT=3000
   DB_URL=http://localhost:3001
   ```

5. **Start the database server**

   ```bash
   npm run dev:db
   ```

6. **Start the application**
   ```bash
   npm run dev
   ```

## Configuration

### Environment Variables

| Variable   | Description             | Default                 | Required |
| ---------- | ----------------------- | ----------------------- | -------- |
| `APP_PORT` | Port for the API server | `3000`                  | No       |
| `DB_URL`   | Database server URL     | `http://localhost:3001` | Yes      |

### Database Configuration

The application uses JSON Server for development. The database file is located at `src/db/db.json` and contains:

- Flight records
- Airport data
- Airspace definitions

## API Documentation

### Base URL

```
http://localhost:3000
```

### Authentication

Currently, no authentication is required. All endpoints are publicly accessible.

### Endpoints

#### Flights

##### GET /flights

Retrieve all flights

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

##### POST /flights

Create a new flight

**Request Body:**

```json
{
  "arrivalAerodrome": "LAX",
  "arrivalTime": "2024-01-01T12:00:00Z",
  "departureAerodrome": "JFK",
  "departureTime": "2024-01-01T10:00:00Z"
}
```

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

##### GET /flights/:id/details

Get flight details by ID

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

##### GET /flights/:id/position

Get flight position at a specific time

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

##### GET /flights/:id/in-airspace

Check if flight is within specified airspace

**Query Parameters:**

- `bottomLeftX`: Bottom-left longitude coordinate
- `bottomLeftY`: Bottom-left latitude coordinate
- `topRightX`: Top-right longitude coordinate
- `topRightY`: Top-right latitude coordinate
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

#### Airports

##### GET /flights/airports

Get all airports

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
    }
  ]
}
```

### Error Responses

All endpoints return appropriate HTTP status codes and error messages:

```json
{
  "message": "Error description",
  "error": "Detailed error message"
}
```

**Common Status Codes:**

- `200`: Success
- `201`: Created
- `400`: Bad Request (validation errors)
- `404`: Not Found
- `500`: Internal Server Error

## Usage Examples

### Creating a Flight

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

### Getting Flight Position

```bash
curl "http://localhost:3000/flights/1/position?time=2024-01-01T11:00:00Z"
```

### Checking Airspace

```bash
curl "http://localhost:3000/flights/1/in-airspace?bottomLeftX=-10&bottomLeftY=-10&topRightX=10&topRightY=10"
```

### JavaScript/TypeScript Example

```typescript
// Create a flight
const flight = await fetch('http://localhost:3000/flights', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    arrivalAerodrome: 'LAX',
    arrivalTime: '2024-01-01T12:00:00Z',
    departureAerodrome: 'JFK',
    departureTime: '2024-01-01T10:00:00Z',
  }),
});

// Get flight position
const position = await fetch(
  'http://localhost:3000/flights/1/position?time=2024-01-01T11:00:00Z'
);

// Check airspace
const airspace = await fetch(
  'http://localhost:3000/flights/1/in-airspace?bottomLeftX=-10&bottomLeftY=-10&topRightX=10&topRightY=10'
);
```

## Testing

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### Test Coverage

The test suite provides comprehensive coverage:

- **Overall Coverage**: 91.74% statements, 76.74% branches, 95.45% functions
- **Models**: 98.27% coverage
- **Services**: 100% coverage
- **Utils**: 100% coverage
- **Database**: 100% coverage
- **Middlewares**: 100% coverage

### Test Structure

```
test/
├── controllers/          # API endpoint tests
├── db/                   # Database service tests
├── middlewares/          # Validation middleware tests
├── models/               # Data model tests
├── services/             # Business logic tests
├── utils/                # Utility function tests
├── setup.ts             # Test configuration
└── test-data.ts         # Shared test fixtures
```

## Development

### Project Structure

```
src/
├── constants/            # Application constants
├── controllers/          # Express route handlers
├── db/                   # Database service and data
├── middlewares/          # Express middlewares
├── models/               # Data models
├── services/             # Business logic services
├── utils/                # Utility functions
└── index.ts             # Application entry point
```

### Available Scripts

```bash
# Development
npm run dev              # Start development server
npm run dev:db          # Start database server

# Building
npm run build           # Build TypeScript to JavaScript
npm start              # Start production server

# Testing
npm test               # Run tests
npm run test:watch     # Run tests in watch mode
npm run test:coverage  # Run tests with coverage
```

### Code Style

The project uses TypeScript with strict type checking. Key conventions:

- Use interfaces for data structures
- Implement proper error handling
- Use async/await for asynchronous operations
- Follow RESTful API conventions
- Write comprehensive tests

### Adding New Features

1. **Models**: Define data structures in `src/models/`
2. **Services**: Implement business logic in `src/services/`
3. **Controllers**: Add API endpoints in `src/controllers/`
4. **Tests**: Write tests in `test/` directory
5. **Documentation**: Update this README

## Deployment

### Production Build

```bash
# Build the application
npm run build

# Start production server
npm start
```

### Environment Setup

1. Set production environment variables
2. Configure production database
3. Set up reverse proxy (nginx)
4. Configure SSL certificates
5. Set up monitoring and logging

### Docker Deployment

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY dist/ ./dist/
EXPOSE 3000
CMD ["npm", "start"]
```

## Documentation

Comprehensive documentation is available in the `docs/` directory:

- **[Quick Start Guide](docs/QUICK_START.md)** - Get up and running in minutes
- **[API Reference](docs/API_REFERENCE.md)** - Complete API endpoint documentation
- **[API Guide](docs/API.md)** - Detailed API usage and examples
- **[Development Guide](docs/DEVELOPMENT.md)** - Technical details for developers
- **[Deployment Guide](docs/DEPLOYMENT.md)** - Production deployment instructions
- **[Test Documentation](test/README.md)** - Testing framework and guidelines

### Documentation Index

| Document                               | Description         | Audience   |
| -------------------------------------- | ------------------- | ---------- |
| [Quick Start](docs/QUICK_START.md)     | Get started quickly | All users  |
| [API Reference](docs/API_REFERENCE.md) | Complete API docs   | Developers |
| [API Guide](docs/API.md)               | Usage examples      | API users  |
| [Development](docs/DEVELOPMENT.md)     | Technical details   | Developers |
| [Deployment](docs/DEPLOYMENT.md)       | Production setup    | DevOps     |
| [Tests](test/README.md)                | Testing guide       | Developers |

## Contributing

### Development Workflow

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Write tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

### Code Review Process

- All code must pass tests
- Code coverage must be maintained
- Follow existing code style
- Include documentation for new features

## License

This project is licensed under the ISC License.

## Support

For questions or support, please:

1. Check the [documentation](docs/README.md)
2. Review existing issues
3. Create a new issue with detailed information

## Changelog

### Version 1.0.0

- Initial release
- Flight management API
- Position calculation service
- Airspace monitoring
- Comprehensive test suite (91.74% coverage)
- Complete documentation suite
