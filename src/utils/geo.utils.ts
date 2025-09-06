import { EARTH_RADIUS } from '../constants';
import { Coordinate } from '../models/coordinate.model';

export class GeoUtilities {
  /**
   * Converts an angle from degrees to radians.
   * @param degrees The angle in degrees to convert.
   * @return The angle in radians.
   */
  public static toRadians(degrees: number): number {
    return (degrees * Math.PI) / 180;
  }

  /**
   * Converts an angle from radians to degrees.
   * @param radians The angle in radians to convert.
   * @return The angle in degrees.
   */
  public static toDegrees(radians: number): number {
    return (radians * 180) / Math.PI;
  }

  /**
   * Calculates the great-circle distance between two coordinates using the Haversine formula.
   * @param c1 The starting coordinate (e.g., departure aerodrome).
   * @param c2 The ending coordinate (e.g., arrival aerodrome).
   * @return The distance in kilometers.
   */
  public static haversine(c1: Coordinate, c2: Coordinate): number {
    const dLat = this.toRadians(c2.getY() - c1.getY());
    const dLon = this.toRadians(c2.getX() - c1.getX());
    const lat1 = this.toRadians(c1.getY());
    const lat2 = this.toRadians(c2.getY());

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return EARTH_RADIUS * c;
  }

  /**
   * Calculates the initial bearing from one coordinate to another.
   * @param c1 The starting coordinate (e.g., departure aerodrome).
   * @param c2 The ending coordinate (e.g., arrival aerodrome).
   * @return The initial bearing in degrees (0-360) from north.
   */
  public static initialBearing(c1: Coordinate, c2: Coordinate): number {
    const lat1 = this.toRadians(c1.getY());
    const lat2 = this.toRadians(c2.getY());
    const dLon = this.toRadians(c2.getX() - c1.getX());

    const y = Math.sin(dLon) * Math.cos(lat2);
    const x =
      Math.cos(lat1) * Math.sin(lat2) -
      Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon);
    const bearing = this.toDegrees(Math.atan2(y, x));
    return (bearing + 360) % 360;
  }

  /**
   * Calculates the destination coordinate given a starting point, distance, and bearing.
   *
   * @param start The starting coordinate (e.g., the departure aerodrome's position).
   * @param dist The distance to travel from the starting point in kilometers.
   * @param bearing The initial bearing in degrees (0-360) from north, indicating the direction of travel.
   * @return The destination coordinate after traveling the specified distance and bearing.
   */
  public static destinationPoint(
    start: Coordinate,
    dist: number,
    bearing: number
  ): Coordinate {
    const delta = dist / EARTH_RADIUS;
    const lat1 = this.toRadians(start.getY());
    const lon1 = this.toRadians(start.getX());
    const brng = this.toRadians(bearing);

    const lat2 = Math.asin(
      Math.sin(lat1) * Math.cos(delta) +
        Math.cos(lat1) * Math.sin(delta) * Math.cos(brng)
    );
    const lon2 =
      lon1 +
      Math.atan2(
        Math.sin(brng) * Math.sin(delta) * Math.cos(lat1),
        Math.cos(delta) - Math.sin(lat1) * Math.sin(lat2)
      );

    let normLon = this.toDegrees(lon2);
    normLon = ((normLon + 540) % 360) - 180;

    const roundedLon = parseFloat(normLon.toFixed(4));
    const roundedLat = parseFloat(this.toDegrees(lat2).toFixed(4));

    return new Coordinate(roundedLon, roundedLat);
  }
}
