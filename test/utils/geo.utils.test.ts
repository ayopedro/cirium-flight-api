import { GeoUtilities } from '../../src/utils/geo.utils';
import { Coordinate } from '../../src/models/coordinate.model';

describe('GeoUtilities', () => {
  describe('toRadians', () => {
    it('should convert degrees to radians correctly', () => {
      expect(GeoUtilities.toRadians(0)).toBe(0);
      expect(GeoUtilities.toRadians(90)).toBe(Math.PI / 2);
      expect(GeoUtilities.toRadians(180)).toBe(Math.PI);
      expect(GeoUtilities.toRadians(360)).toBe(2 * Math.PI);
      expect(GeoUtilities.toRadians(45)).toBe(Math.PI / 4);
    });

    it('should handle negative degrees', () => {
      expect(GeoUtilities.toRadians(-90)).toBe(-Math.PI / 2);
      expect(GeoUtilities.toRadians(-180)).toBe(-Math.PI);
    });

    it('should handle decimal degrees', () => {
      const result = GeoUtilities.toRadians(30.5);
      expect(result).toBeCloseTo((30.5 * Math.PI) / 180, 10);
    });
  });

  describe('toDegrees', () => {
    it('should convert radians to degrees correctly', () => {
      expect(GeoUtilities.toDegrees(0)).toBe(0);
      expect(GeoUtilities.toDegrees(Math.PI / 2)).toBe(90);
      expect(GeoUtilities.toDegrees(Math.PI)).toBe(180);
      expect(GeoUtilities.toDegrees(2 * Math.PI)).toBe(360);
      expect(GeoUtilities.toDegrees(Math.PI / 4)).toBe(45);
    });

    it('should handle negative radians', () => {
      expect(GeoUtilities.toDegrees(-Math.PI / 2)).toBe(-90);
      expect(GeoUtilities.toDegrees(-Math.PI)).toBe(-180);
    });

    it('should handle decimal radians', () => {
      const result = GeoUtilities.toDegrees(0.5);
      expect(result).toBeCloseTo((0.5 * 180) / Math.PI, 10);
    });
  });

  describe('haversine', () => {
    it('should calculate distance between same coordinates as 0', () => {
      const coord = new Coordinate(0, 0);
      expect(GeoUtilities.haversine(coord, coord)).toBe(0);
    });

    it('should calculate distance between known coordinates', () => {
      // New York to Los Angeles (approximately 3944 km)
      const nyc = new Coordinate(-74.006, 40.7128);
      const la = new Coordinate(-118.2437, 34.0522);
      const distance = GeoUtilities.haversine(nyc, la);

      expect(distance).toBeCloseTo(3936, 0); // Within 10 km accuracy
    });

    it('should calculate distance between antipodal points', () => {
      // Antipodal points should be approximately half the Earth's circumference
      const point1 = new Coordinate(0, 0);
      const point2 = new Coordinate(180, 0);
      const distance = GeoUtilities.haversine(point1, point2);

      expect(distance).toBeCloseTo(20015, 0); // Half Earth's circumference
    });

    it('should handle coordinates across the antimeridian', () => {
      const point1 = new Coordinate(179, 0);
      const point2 = new Coordinate(-179, 0);
      const distance = GeoUtilities.haversine(point1, point2);

      expect(distance).toBeCloseTo(222, 0); // Short distance across antimeridian
    });

    it('should be symmetric', () => {
      const coord1 = new Coordinate(10, 20);
      const coord2 = new Coordinate(30, 40);

      const distance1 = GeoUtilities.haversine(coord1, coord2);
      const distance2 = GeoUtilities.haversine(coord2, coord1);

      expect(distance1).toBeCloseTo(distance2, 10);
    });
  });

  describe('initialBearing', () => {
    it('should calculate bearing from north as 0 degrees', () => {
      const start = new Coordinate(0, 0);
      const north = new Coordinate(0, 1);
      const bearing = GeoUtilities.initialBearing(start, north);

      expect(bearing).toBeCloseTo(0, 1);
    });

    it('should calculate bearing to east as 90 degrees', () => {
      const start = new Coordinate(0, 0);
      const east = new Coordinate(1, 0);
      const bearing = GeoUtilities.initialBearing(start, east);

      expect(bearing).toBeCloseTo(90, 1);
    });

    it('should calculate bearing to south as 180 degrees', () => {
      const start = new Coordinate(0, 0);
      const south = new Coordinate(0, -1);
      const bearing = GeoUtilities.initialBearing(start, south);

      expect(bearing).toBeCloseTo(180, 1);
    });

    it('should calculate bearing to west as 270 degrees', () => {
      const start = new Coordinate(0, 0);
      const west = new Coordinate(-1, 0);
      const bearing = GeoUtilities.initialBearing(start, west);

      expect(bearing).toBeCloseTo(270, 1);
    });

    it('should return bearing between 0 and 360 degrees', () => {
      const start = new Coordinate(0, 0);
      const end = new Coordinate(1, 1);
      const bearing = GeoUtilities.initialBearing(start, end);

      expect(bearing).toBeGreaterThanOrEqual(0);
      expect(bearing).toBeLessThan(360);
    });

    it('should handle coordinates across the antimeridian', () => {
      const start = new Coordinate(179, 0);
      const end = new Coordinate(-179, 0);
      const bearing = GeoUtilities.initialBearing(start, end);

      expect(bearing).toBeGreaterThanOrEqual(0);
      expect(bearing).toBeLessThan(360);
    });
  });

  describe('destinationPoint', () => {
    it('should return the same point when distance is 0', () => {
      const start = new Coordinate(0, 0);
      const destination = GeoUtilities.destinationPoint(start, 0, 0);

      expect(destination.getX()).toBeCloseTo(start.getX(), 4);
      expect(destination.getY()).toBeCloseTo(start.getY(), 4);
    });

    it('should move north when bearing is 0 degrees', () => {
      const start = new Coordinate(0, 0);
      const destination = GeoUtilities.destinationPoint(start, 1000, 0); // 1000 km north

      expect(destination.getX()).toBeCloseTo(0, 1);
      expect(destination.getY()).toBeGreaterThan(start.getY());
    });

    it('should move east when bearing is 90 degrees', () => {
      const start = new Coordinate(0, 0);
      const destination = GeoUtilities.destinationPoint(start, 1000, 90); // 1000 km east

      expect(destination.getX()).toBeGreaterThan(start.getX());
      expect(destination.getY()).toBeCloseTo(0, 1);
    });

    it('should move south when bearing is 180 degrees', () => {
      const start = new Coordinate(0, 0);
      const destination = GeoUtilities.destinationPoint(start, 1000, 180); // 1000 km south

      expect(destination.getX()).toBeCloseTo(0, 1);
      expect(destination.getY()).toBeLessThan(start.getY());
    });

    it('should move west when bearing is 270 degrees', () => {
      const start = new Coordinate(0, 0);
      const destination = GeoUtilities.destinationPoint(start, 1000, 270); // 1000 km west

      expect(destination.getX()).toBeLessThan(start.getX());
      expect(destination.getY()).toBeCloseTo(0, 1);
    });

    it('should handle longitude normalization', () => {
      const start = new Coordinate(0, 0);
      const destination = GeoUtilities.destinationPoint(start, 1000, 90);

      // Longitude should be normalized to -180 to 180 range
      expect(destination.getX()).toBeGreaterThanOrEqual(-180);
      expect(destination.getX()).toBeLessThanOrEqual(180);
    });

    it('should handle large distances', () => {
      const start = new Coordinate(0, 0);
      const destination = GeoUtilities.destinationPoint(start, 10000, 0); // 10000 km north

      expect(destination.getY()).toBeGreaterThan(start.getY());
      expect(destination.getY()).toBeLessThan(90); // Should not exceed North Pole
    });

    it('should round coordinates to 4 decimal places', () => {
      const start = new Coordinate(0, 0);
      const destination = GeoUtilities.destinationPoint(start, 1000, 45);

      // Check that coordinates are rounded to 4 decimal places
      const xRounded = parseFloat(destination.getX().toFixed(4));
      const yRounded = parseFloat(destination.getY().toFixed(4));

      expect(destination.getX()).toBe(xRounded);
      expect(destination.getY()).toBe(yRounded);
    });
  });
});
