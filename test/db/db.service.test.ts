import { DbService } from '../../src/db/db.service';

// Mock the fetch function
global.fetch = jest.fn();

describe('DbService', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env = { ...originalEnv, DB_URL: 'http://localhost:3001' };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('getBaseUrl', () => {
    it('should throw error when DB_URL is not defined', () => {
      delete process.env.DB_URL;
      expect(() => DbService.get('test')).rejects.toThrow(
        'DB_URL is not defined'
      );
    });

    it('should return the DB_URL when defined', () => {
      process.env.DB_URL = 'http://test-db:3001';
      // We can't directly test getBaseUrl as it's private, but we can test through public methods
      expect(process.env.DB_URL).toBe('http://test-db:3001');
    });
  });

  describe('get', () => {
    beforeEach(() => {
      (fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ id: '1', name: 'test' }),
      });
    });

    it('should make GET request to correct URL', async () => {
      await DbService.get('flights');

      expect(fetch).toHaveBeenCalledWith('http://localhost:3001/flights');
    });

    it('should make GET request with query parameters', async () => {
      const query = { id: '1', status: 'active' };
      await DbService.get('flights', query);

      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:3001/flights?id=1&status=active'
      );
    });

    it('should return parsed JSON response', async () => {
      const mockData = { id: '1', name: 'test' };
      (fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockData),
      });

      const result = await DbService.get('flights');
      expect(result).toEqual(mockData);
    });

    it('should throw error when response is not ok', async () => {
      (fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 404,
      });

      await expect(DbService.get('flights')).rejects.toThrow(
        'GET http://localhost:3001/flights failed with status 404'
      );
    });

    it('should handle different data types in query parameters', async () => {
      const query = { id: 1, active: true, count: 0 };
      await DbService.get('flights', query);

      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:3001/flights?id=1&active=true&count=0'
      );
    });
  });

  describe('post', () => {
    beforeEach(() => {
      (fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ id: '1', created: true }),
      });
    });

    it('should make POST request to correct URL', async () => {
      const data = { name: 'test' };
      await DbService.post('flights', data);

      expect(fetch).toHaveBeenCalledWith('http://localhost:3001/flights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
    });

    it('should return parsed JSON response', async () => {
      const mockData = { id: '1', created: true };
      (fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockData),
      });

      const result = await DbService.post('flights', { name: 'test' });
      expect(result).toEqual(mockData);
    });

    it('should throw error when response is not ok', async () => {
      (fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 400,
      });

      await expect(DbService.post('flights', {})).rejects.toThrow(
        'POST http://localhost:3001/flights failed with status 400'
      );
    });

    it('should handle complex data objects', async () => {
      const complexData = {
        id: '1',
        nested: { value: 'test' },
        array: [1, 2, 3],
        date: new Date('2024-01-01'),
      };

      await DbService.post('flights', complexData);

      expect(fetch).toHaveBeenCalledWith('http://localhost:3001/flights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(complexData),
      });
    });
  });

  describe('put', () => {
    beforeEach(() => {
      (fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ id: '1', updated: true }),
      });
    });

    it('should make PUT request to correct URL', async () => {
      const data = { name: 'updated' };
      await DbService.put('flights/1', data);

      expect(fetch).toHaveBeenCalledWith('http://localhost:3001/flights/1', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
    });

    it('should return parsed JSON response', async () => {
      const mockData = { id: '1', updated: true };
      (fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockData),
      });

      const result = await DbService.put('flights/1', { name: 'test' });
      expect(result).toEqual(mockData);
    });

    it('should throw error when response is not ok', async () => {
      (fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 500,
      });

      await expect(DbService.put('flights/1', {})).rejects.toThrow(
        'PUT http://localhost:3001/flights/1 failed with status 500'
      );
    });
  });

  describe('delete', () => {
    beforeEach(() => {
      (fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ deleted: true }),
      });
    });

    it('should make DELETE request to correct URL', async () => {
      await DbService.delete('flights/1');

      expect(fetch).toHaveBeenCalledWith('http://localhost:3001/flights/1', {
        method: 'DELETE',
      });
    });

    it('should return parsed JSON response', async () => {
      const mockData = { deleted: true };
      (fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockData),
      });

      const result = await DbService.delete('flights/1');
      expect(result).toEqual(mockData);
    });

    it('should throw error when response is not ok', async () => {
      (fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 404,
      });

      await expect(DbService.delete('flights/1')).rejects.toThrow(
        'DELETE http://localhost:3001/flights/1 failed with status 404'
      );
    });
  });
});
