// Test setup file
import 'dotenv/config';

// Mock environment variables for testing
process.env.DB_URL = 'http://localhost:3001';
process.env.APP_PORT = '3000';

// Global test timeout
jest.setTimeout(10000);
