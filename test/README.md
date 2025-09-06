# Test Suite Documentation

This directory contains comprehensive tests for the Cirium Task application. The test suite is built with Jest and covers all major components of the application.

## Test Structure

```
test/
├── controllers/          # Integration tests for API endpoints
├── db/                   # Unit tests for database service
├── middlewares/          # Unit tests for validation middlewares
├── models/               # Unit tests for data models
├── services/             # Unit tests for business logic services
├── utils/                # Unit tests for utility functions
├── setup.ts             # Test configuration and setup
├── test-data.ts         # Shared test data and fixtures
└── README.md            # This file
```

## Running Tests

### All Tests

```bash
npm test
```

### Watch Mode

```bash
npm run test:watch
```

### Coverage Report

```bash
npm run test:coverage
```

## Test Categories

### 1. Model Tests (`models/`)

- **Coordinate Model**: Tests for coordinate creation, getters, and validation
- **Airspace Model**: Tests for airspace creation, boundary checking, and antimeridian handling
- **Flight Model**: Tests for flight creation, position calculation, and error handling

### 2. Utility Tests (`utils/`)

- **GeoUtilities**: Tests for geographic calculations including:
  - Degree/radian conversions
  - Haversine distance calculations
  - Bearing calculations
  - Destination point calculations

### 3. Service Tests (`services/`)

- **FlightService**: Tests for all business logic operations:
  - Flight creation and retrieval
  - Position calculations
  - Airspace checking
  - Error handling

### 4. Database Tests (`db/`)

- **DbService**: Tests for all database operations:
  - GET, POST, PUT, DELETE operations
  - Query parameter handling
  - Error handling
  - Response parsing

### 5. Middleware Tests (`middlewares/`)

- **Validation Middleware**: Tests for request body validation
- **Query Validation Middleware**: Tests for query parameter validation

### 6. Controller Tests (`controllers/`)

- **FlightController**: Integration tests for all API endpoints:
  - GET /flights - List all flights
  - GET /flights/airports - List airports
  - GET /flights/:id/details - Get flight details
  - POST /flights - Create new flight
  - GET /flights/:id/position - Get flight position
  - GET /flights/:id/in-airspace - Check if flight is in airspace

## Test Features

### Mocking

- Database operations are mocked to avoid external dependencies
- External API calls are mocked for consistent testing
- Time-dependent operations use mocked dates

### Error Testing

- All endpoints test both success and error scenarios
- Validation errors are thoroughly tested
- Service errors are properly handled and tested

### Edge Cases

- Antimeridian crossing in airspace calculations
- Boundary conditions in coordinate validation
- Invalid data handling in all layers

### Coverage

- Unit tests cover individual functions and methods
- Integration tests cover API endpoints end-to-end
- Error paths are tested for robustness

## Test Data

The `test-data.ts` file contains shared test fixtures including:

- Valid and invalid flight data
- Mock airport information
- Sample coordinates for testing
- Airspace definitions
- Test dates for time-based operations

## Configuration

Tests are configured in `jest.config.js` with:

- TypeScript support via ts-jest
- Coverage reporting
- Test file patterns
- Module name mapping

## Best Practices

1. **Isolation**: Each test is independent and doesn't affect others
2. **Clarity**: Test names clearly describe what is being tested
3. **Coverage**: Both happy path and error scenarios are tested
4. **Maintainability**: Tests are organized logically and use shared fixtures
5. **Performance**: Tests run quickly with proper mocking

## Adding New Tests

When adding new functionality:

1. **Unit Tests**: Add tests for new models, services, or utilities
2. **Integration Tests**: Add tests for new API endpoints
3. **Error Tests**: Ensure error scenarios are covered
4. **Edge Cases**: Test boundary conditions and special cases
5. **Update Fixtures**: Add new test data to `test-data.ts` if needed

## Debugging Tests

To debug failing tests:

1. Run specific test file: `npm test -- flight.service.test.ts`
2. Use `--verbose` flag for detailed output
3. Add `console.log` statements in tests
4. Use Jest's `--detectOpenHandles` to find async issues

## Continuous Integration

The test suite is designed to run in CI environments:

- No external dependencies required
- All operations are mocked
- Tests run in parallel for speed
- Coverage reports are generated
