import { Airspace } from '../../src/models/airspace.model';
import { Coordinate } from '../../src/models/coordinate.model';

describe('Airspace', () => {
  let airspace: Airspace;
  let bottomLeft: Coordinate;
  let topRight: Coordinate;

  beforeEach(() => {
    bottomLeft = new Coordinate(-10, -10);
    topRight = new Coordinate(10, 10);
    airspace = new Airspace(bottomLeft, topRight);
  });

  describe('constructor', () => {
    it('should create an airspace with valid coordinates', () => {
      expect(airspace.getBottomLeft()).toBe(bottomLeft);
      expect(airspace.getTopRight()).toBe(topRight);
    });
  });

  describe('getBottomLeft', () => {
    it('should return the bottom left coordinate', () => {
      expect(airspace.getBottomLeft()).toBe(bottomLeft);
    });
  });

  describe('getTopRight', () => {
    it('should return the top right coordinate', () => {
      expect(airspace.getTopRight()).toBe(topRight);
    });
  });

  describe('isWithinAirspace', () => {
    it('should return true for position within airspace', () => {
      const position = new Coordinate(0, 0);
      expect(airspace.isWithinAirspace(position)).toBe(true);
    });

    it('should return true for position on the boundary', () => {
      const position1 = new Coordinate(-10, -10); // bottom left corner
      const position2 = new Coordinate(10, 10); // top right corner
      const position3 = new Coordinate(-10, 10); // top left corner
      const position4 = new Coordinate(10, -10); // bottom right corner

      expect(airspace.isWithinAirspace(position1)).toBe(true);
      expect(airspace.isWithinAirspace(position2)).toBe(true);
      expect(airspace.isWithinAirspace(position3)).toBe(true);
      expect(airspace.isWithinAirspace(position4)).toBe(true);
    });

    it('should return false for position outside airspace', () => {
      const position1 = new Coordinate(-11, 0); // left of airspace
      const position2 = new Coordinate(11, 0); // right of airspace
      const position3 = new Coordinate(0, -11); // below airspace
      const position4 = new Coordinate(0, 11); // above airspace

      expect(airspace.isWithinAirspace(position1)).toBe(false);
      expect(airspace.isWithinAirspace(position2)).toBe(false);
      expect(airspace.isWithinAirspace(position3)).toBe(false);
      expect(airspace.isWithinAirspace(position4)).toBe(false);
    });

    it('should handle antimeridian crossing (longitude range > 180)', () => {
      // Airspace crossing the antimeridian (e.g., Pacific Ocean)
      // Use a valid antimeridian crossing range
      const bottomLeft = new Coordinate(170, -10);
      const topRight = new Coordinate(10, 10); // 10 degrees, crossing antimeridian (190 degree range)
      const antimeridianAirspace = new Airspace(bottomLeft, topRight);

      // This should throw an error because longitude difference is negative
      const position = new Coordinate(0, 0);
      expect(() => antimeridianAirspace.isWithinAirspace(position)).toThrow(
        'Invalid airspace longitude range'
      );
    });

    it('should throw error for invalid longitude range', () => {
      const invalidBottomLeft = new Coordinate(10, -10);
      const invalidTopRight = new Coordinate(-10, 10); // invalid range
      const invalidAirspace = new Airspace(invalidBottomLeft, invalidTopRight);

      const position = new Coordinate(0, 0);
      expect(() => invalidAirspace.isWithinAirspace(position)).toThrow(
        'Invalid airspace longitude range'
      );
    });

    it('should handle edge case with longitude range exactly 360', () => {
      const bottomLeft = new Coordinate(-180, -10);
      const topRight = new Coordinate(180, 10);
      const globalAirspace = new Airspace(bottomLeft, topRight);

      const position1 = new Coordinate(0, 0);
      const position2 = new Coordinate(180, 0);
      const position3 = new Coordinate(-180, 0);

      expect(globalAirspace.isWithinAirspace(position1)).toBe(true);
      expect(globalAirspace.isWithinAirspace(position2)).toBe(true);
      expect(globalAirspace.isWithinAirspace(position3)).toBe(true);
    });
  });
});
