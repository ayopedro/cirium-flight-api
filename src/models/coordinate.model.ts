export class Coordinate {
  /**
   * Construct a coordinate.
   * @param x the X component (-180 to +180).
   * @param y the Y component (-90 to +90).
   */
  constructor(private readonly x: number, private readonly y: number) {}

  getX(): number {
    return this.x;
  }

  getY(): number {
    return this.y;
  }
}
