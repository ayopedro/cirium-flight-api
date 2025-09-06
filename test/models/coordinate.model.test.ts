import { Coordinate } from '../../src/models/coordinate.model';

describe('Coordinate', () => {
  describe('constructor', () => {
    it('should create a coordinate with valid x and y values', () => {
      const coordinate = new Coordinate(10.5, 20.3);
      expect(coordinate.getX()).toBe(10.5);
      expect(coordinate.getY()).toBe(20.3);
    });

    it('should handle negative coordinates', () => {
      const coordinate = new Coordinate(-10.5, -20.3);
      expect(coordinate.getX()).toBe(-10.5);
      expect(coordinate.getY()).toBe(-20.3);
    });

    it('should handle zero coordinates', () => {
      const coordinate = new Coordinate(0, 0);
      expect(coordinate.getX()).toBe(0);
      expect(coordinate.getY()).toBe(0);
    });

    it('should handle decimal precision', () => {
      const coordinate = new Coordinate(123.456789, -45.123456);
      expect(coordinate.getX()).toBe(123.456789);
      expect(coordinate.getY()).toBe(-45.123456);
    });
  });

  describe('getX', () => {
    it('should return the x coordinate', () => {
      const coordinate = new Coordinate(15.7, 25.9);
      expect(coordinate.getX()).toBe(15.7);
    });
  });

  describe('getY', () => {
    it('should return the y coordinate', () => {
      const coordinate = new Coordinate(15.7, 25.9);
      expect(coordinate.getY()).toBe(25.9);
    });
  });
});
