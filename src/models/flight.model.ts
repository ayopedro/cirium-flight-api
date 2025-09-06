import { Coordinate } from './coordinate.model';
import { GeoUtilities } from '../utils/geo.utils';

export class Flight {
  /**
   * Construct a flight.
   * @param arrivalAerodrome The aerodrome the flight is arriving at.
   * @param arrivalTime The date/time the flight is arriving.
   * @param departureAerodrome The aerodrome the flight is departing from.
   * @param departureTime The date/time the flight is departing.
   */
  constructor(
    private readonly arrivalAerodrome: string,
    private readonly arrivalTime: Date,
    private readonly departureAerodrome: string,
    private readonly departureTime: Date
  ) {}

  private async getAerodromeCoordinate(iata: string): Promise<Coordinate> {
    const url = new URL(`${process.env.DB_URL}/airports`);
    url.searchParams.append('iata', iata);

    const response = await fetch(url.toString());
    if (!response.ok) throw new Error(`Aerodrome ${iata} not found`);

    const airports = (await response.json()) as Array<{
      latitude: number;
      longitude: number;
    }>;
    const airport = airports[0];

    if (!airport) throw new Error(`Aerodrome ${iata} not found`);

    return new Coordinate(airport.longitude, airport.latitude);
  }

  getArrivalAerodrome(): string {
    return this.arrivalAerodrome;
  }

  getArrivalTime(): Date {
    return this.arrivalTime;
  }

  getDepartureAerodrome(): string {
    return this.departureAerodrome;
  }

  getDepartureTime(): Date {
    return this.departureTime;
  }

  async getPosition(time: Date = new Date()): Promise<Coordinate> {
    const depCoord = await this.getAerodromeCoordinate(this.departureAerodrome);
    const arrCoord = await this.getAerodromeCoordinate(this.arrivalAerodrome);

    if (!depCoord || !arrCoord) {
      throw new Error('Unknown aerodrome coordinates');
    }

    if (time <= this.departureTime) {
      return depCoord;
    }
    if (time >= this.arrivalTime) {
      return arrCoord;
    }

    const totalTimeMs =
      this.arrivalTime.getTime() - this.departureTime.getTime();
    const elapsedMs = time.getTime() - this.departureTime.getTime();
    const fraction = elapsedMs / totalTimeMs;

    const totalDistanceKm = GeoUtilities.haversine(depCoord, arrCoord);
    const traveledDistanceKm = fraction * totalDistanceKm;

    const bearing = GeoUtilities.initialBearing(depCoord, arrCoord);

    const position = GeoUtilities.destinationPoint(
      depCoord,
      traveledDistanceKm,
      bearing
    );

    return position;
  }
}
