import type { Coordinate } from './coordinate.model';

export class Airspace {
  /**
   * Construct an Airspace.
   * @param bottomLeft the bottom left coordinate of this airspace.
   * @param topRight the top right coordinate of this airspace.
   */
  constructor(
    private readonly bottomLeft: Coordinate,
    private readonly topRight: Coordinate
  ) {}

  getBottomLeft(): Coordinate {
    return this.bottomLeft;
  }

  getTopRight(): Coordinate {
    return this.topRight;
  }

  /**
   * Determines if a given position is within this airspace (with antimeridian handling).
   * @param position The coordinate to check.
   * @return true if the position is within the airspace, false otherwise.
   */
  isWithinAirspace(position: Coordinate): boolean {
    const lon = position.getX();
    const lat = position.getY();
    const minLon = this.bottomLeft.getX();
    const maxLon = this.topRight.getX();
    const minLat = this.bottomLeft.getY();
    const maxLat = this.topRight.getY();

    const lonDiff = maxLon - minLon;
    if (lonDiff < 0 || lonDiff > 360)
      throw new Error('Invalid airspace longitude range');
    const isInLon =
      lonDiff > 180
        ? lon >= minLon || lon <= maxLon
        : lon >= minLon && lon <= maxLon;
    return isInLon && lat >= minLat && lat <= maxLat;
  }
}
