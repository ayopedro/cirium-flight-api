# Development Guide

## Overview

This document provides detailed information for developers working on the Cirium Task API. It covers the codebase structure, development practices, and implementation details.

## Codebase Structure

```
src/
├── constants/            # Application constants
│   └── index.ts         # Earth radius and other constants
├── controllers/          # Express route handlers
│   └── flight.controller.ts
├── db/                   # Database service and data
│   ├── db.json          # JSON database file
│   └── db.service.ts    # Database service layer
├── middlewares/          # Express middlewares
│   ├── query-validator.middleware.ts
│   └── validation.middleware.ts
├── models/               # Data models
│   ├── airspace.model.ts
│   ├── coordinate.model.ts
│   └── flight.model.ts
├── services/             # Business logic services
│   ├── dto/             # Data Transfer Objects
│   │   ├── create-flight.dto.ts
│   │   └── get-position.dto.ts
│   └── flight.service.ts
├── utils/                # Utility functions
│   ├── geo.utils.ts     # Geographic calculations
│   └── interfaces.ts    # TypeScript interfaces
└── index.ts             # Application entry point
```

## Architecture Patterns

### MVC Pattern

The application follows the Model-View-Controller pattern:

- **Models**: Data structures and business logic (`src/models/`)
- **Controllers**: HTTP request handling (`src/controllers/`)
- **Services**: Business logic layer (`src/services/`)

### Service Layer

The service layer encapsulates business logic and provides a clean interface between controllers and data access:

```typescript
// Example: FlightService
export class FlightService {
  async createFlight(dto: CreateFlightDto): Promise<unknown>
  async getFlights(): Promise<FlightRecord[]>
  async getFlight(id: string): Promise<Flight>
  async getFlightPosition(id: string, dto: GetPositionDto): Promise<Coordinate>
  async isFlightInAirspace(...): Promise<boolean>
}
```

### Dependency Injection

Services are instantiated in controllers and can be easily mocked for testing:

```typescript
// In controller
const flightService = new FlightService();

// In tests
jest.mock('../../src/services/flight.service');
```

## Data Models

### Flight Model

The `Flight` class represents a flight with departure and arrival information:

```typescript
export class Flight {
  constructor(
    private readonly arrivalAerodrome: string,
    private readonly arrivalTime: Date,
    private readonly departureAerodrome: string,
    private readonly departureTime: Date
  ) {}

  async getPosition(time: Date = new Date()): Promise<Coordinate>;
  getArrivalAerodrome(): string;
  getArrivalTime(): Date;
  getDepartureAerodrome(): string;
  getDepartureTime(): Date;
}
```

**Key Features:**

- Immutable properties (readonly)
- Async position calculation
- Airport coordinate lookup
- Geographic interpolation

### Coordinate Model

Represents a geographic coordinate:

```typescript
export class Coordinate {
  constructor(
    private readonly x: number, // Longitude
    private readonly y: number // Latitude
  ) {}

  getX(): number;
  getY(): number;
}
```

### Airspace Model

Represents a rectangular airspace area:

```typescript
export class Airspace {
  constructor(
    private readonly bottomLeft: Coordinate,
    private readonly topRight: Coordinate
  ) {}

  isWithinAirspace(position: Coordinate): boolean;
}
```

**Features:**

- Antimeridian crossing support
- Boundary validation
- Geographic coordinate checking

## Geographic Calculations

### GeoUtilities Class

The `GeoUtilities` class provides static methods for geographic calculations:

```typescript
export class GeoUtilities {
  static toRadians(degrees: number): number;
  static toDegrees(radians: number): number;
  static haversine(c1: Coordinate, c2: Coordinate): number;
  static initialBearing(c1: Coordinate, c2: Coordinate): number;
  static destinationPoint(
    start: Coordinate,
    dist: number,
    bearing: number
  ): Coordinate;
}
```

### Haversine Formula

Used for calculating great-circle distances between two points:

```typescript
public static haversine(c1: Coordinate, c2: Coordinate): number {
  const dLat = this.toRadians(c2.getY() - c1.getY());
  const dLon = this.toRadians(c2.getX() - c1.getX());
  const lat1 = this.toRadians(c1.getY());
  const lat2 = this.toRadians(c2.getY());

  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return EARTH_RADIUS * c;
}
```

### Position Interpolation

Flight positions are calculated using linear interpolation:

1. Calculate total flight time
2. Calculate elapsed time
3. Determine progress fraction
4. Calculate total distance using Haversine formula
5. Calculate traveled distance
6. Determine bearing from departure to arrival
7. Calculate destination point

## Database Layer

### DbService

The `DbService` provides a clean interface to the database:

```typescript
export class DbService {
  static async get<T>(
    path: string,
    query?: Record<string, string | number>
  ): Promise<T>;
  static async post<T>(path: string, data: any): Promise<T>;
  static async put<T>(path: string, data: any): Promise<T>;
  static async delete<T>(path: string): Promise<T>;
}
```

**Features:**

- Generic type support
- Query parameter handling
- Error handling
- HTTP method abstraction

### JSON Database

The application uses JSON Server for development:

```json
{
  "flights": [
    {
      "id": "1",
      "arrivalAerodrome": "LAX",
      "arrivalTime": "2024-01-01T12:00:00Z",
      "departureAerodrome": "JFK",
      "departureTime": "2024-01-01T10:00:00Z"
    }
  ],
  "airports": [
    {
      "iata": "JFK",
      "name": "John F. Kennedy International Airport",
      "latitude": 40.6413,
      "longitude": -73.7781
    }
  ]
}
```

## Validation

### DTOs (Data Transfer Objects)

DTOs define the structure of incoming data:

```typescript
export class CreateFlightDto {
  @IsString()
  @IsNotEmpty()
  arrivalAerodrome!: string;

  @IsDateString()
  @IsNotEmpty()
  arrivalTime!: string;

  @IsString()
  @IsNotEmpty()
  departureAerodrome!: string;

  @IsDateString()
  @IsNotEmpty()
  departureTime!: string;
}
```

### Validation Middleware

Two validation middlewares handle different types of validation:

1. **Body Validation**: For POST/PUT requests
2. **Query Validation**: For query parameters

```typescript
// Body validation
export function validationMiddleware(type: any) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const dto = plainToInstance(type, req.body);
    const errors = await validate(dto);
    // ... validation logic
  };
}

// Query validation
export function queryValidationMiddleware(type: any) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const errors = await validate(plainToInstance(type, req.query));
    // ... validation logic
  };
}
```

## Error Handling

### Error Types

1. **Validation Errors**: Invalid input data
2. **Service Errors**: Business logic failures
3. **Database Errors**: Data access failures
4. **Geographic Errors**: Invalid coordinates or calculations

### Error Response Format

```typescript
interface ErrorResponse {
  message: string;
  error?: string;
  errors?: string[];
}
```

### Error Handling Strategy

1. **Controllers**: Handle HTTP-specific errors
2. **Services**: Handle business logic errors
3. **Models**: Handle data validation errors
4. **Utils**: Handle calculation errors

## Testing

### Test Structure

```
test/
├── controllers/          # Integration tests
├── db/                   # Database tests
├── middlewares/          # Middleware tests
├── models/               # Model tests
├── services/             # Service tests
├── utils/                # Utility tests
├── setup.ts             # Test configuration
└── test-data.ts         # Test fixtures
```

### Testing Patterns

1. **Unit Tests**: Test individual functions and methods
2. **Integration Tests**: Test API endpoints end-to-end
3. **Mocking**: Mock external dependencies
4. **Fixtures**: Use shared test data

### Mocking Strategy

```typescript
// Mock external dependencies
jest.mock('../../src/db/db.service');
jest.mock('../../src/models/flight.model');

// Mock fetch for external API calls
global.fetch = jest.fn();
```

## Development Workflow

### Setting Up Development Environment

1. **Clone Repository**

   ```bash
   git clone <repository-url>
   cd cirium-task
   ```

2. **Install Dependencies**

   ```bash
   npm install
   ```

3. **Start Database**

   ```bash
   npm run dev:db
   ```

4. **Start Application**
   ```bash
   npm run dev
   ```

### Code Quality

1. **TypeScript**: Strict type checking enabled
2. **ESLint**: Code style enforcement
3. **Prettier**: Code formatting
4. **Tests**: Comprehensive test coverage

### Git Workflow

1. **Feature Branches**: Create feature branches for new functionality
2. **Commit Messages**: Use conventional commit messages
3. **Pull Requests**: Review all changes before merging
4. **Tests**: Ensure all tests pass before merging

## Performance Considerations

### Database Queries

- Use efficient query patterns
- Implement pagination for large datasets
- Cache frequently accessed data

### Geographic Calculations

- Cache calculated positions when possible
- Use efficient algorithms for distance calculations
- Consider precision vs. performance trade-offs

### Memory Management

- Avoid memory leaks in long-running processes
- Use appropriate data structures
- Monitor memory usage in production

## Security Considerations

### Input Validation

- Validate all input data
- Sanitize user inputs
- Use appropriate data types

### Error Handling

- Don't expose sensitive information in error messages
- Log errors appropriately
- Handle edge cases gracefully

### API Security

- Implement rate limiting
- Add authentication/authorization
- Use HTTPS in production
- Validate request origins

## Deployment

### Environment Configuration

```env
# Development
NODE_ENV=development
APP_PORT=3000
DB_URL=http://localhost:3001

# Production
NODE_ENV=production
APP_PORT=3000
DB_URL=https://api.example.com
```

### Build Process

```bash
# Build TypeScript
npm run build

# Start production server
npm start
```

### Docker Support

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY dist/ ./dist/
EXPOSE 3000
CMD ["npm", "start"]
```

## Monitoring and Logging

### Logging Strategy

1. **Application Logs**: Use structured logging
2. **Error Logs**: Log all errors with context
3. **Performance Logs**: Monitor response times
4. **Audit Logs**: Track important operations

### Health Checks

Implement health check endpoints for monitoring:

```typescript
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});
```

## Troubleshooting

### Common Issues

1. **Database Connection**: Check database server status
2. **Port Conflicts**: Ensure ports are available
3. **Environment Variables**: Verify all required variables are set
4. **Dependencies**: Ensure all packages are installed

### Debug Mode

Enable debug logging:

```bash
DEBUG=* npm run dev
```

### Performance Profiling

Use Node.js profiling tools:

```bash
node --prof dist/index.js
```

## Contributing

### Code Standards

1. **TypeScript**: Use strict typing
2. **Naming**: Use descriptive names
3. **Comments**: Document complex logic
4. **Tests**: Write comprehensive tests

### Pull Request Process

1. **Fork Repository**: Create your own fork
2. **Create Branch**: Use descriptive branch names
3. **Write Tests**: Ensure test coverage
4. **Submit PR**: Include detailed description
5. **Code Review**: Address feedback
6. **Merge**: After approval

### Documentation

- Update README for user-facing changes
- Update API docs for endpoint changes
- Update this guide for architectural changes
- Include examples for new features
