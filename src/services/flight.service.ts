import { Flight } from '../models/flight.model';
import { CreateFlightDto } from './dto/create-flight.dto';
import { GetPositionDto } from './dto/get-position.dto';
import { Coordinate } from '../models/coordinate.model';
import { Airspace } from '../models/airspace.model';
import { DbService } from '../db/db.service';
import { FlightRecord } from '../utils/interfaces';

export class FlightService {
  private dbService = DbService;

  async createFlight(dto: CreateFlightDto): Promise<unknown> {
    return this.dbService.post('flights', dto);
  }

  async getFlights(): Promise<FlightRecord[]> {
    return this.dbService.get<FlightRecord[]>('flights');
  }

  async getFlight(id: string): Promise<Flight> {
    const flightData = await this.dbService.get<FlightRecord>(`/flights/${id}`);
    return new Flight(
      flightData.arrivalAerodrome,
      new Date(flightData.arrivalTime),
      flightData.departureAerodrome,
      new Date(flightData.departureTime)
    );
  }

  async getAirports() {
    return this.dbService.get<FlightRecord[]>('airports');
  }

  async getFlightPosition(
    id: string,
    dto: GetPositionDto
  ): Promise<Coordinate> {
    const flight = await this.getFlight(id);

    const atTime = dto.time ? new Date(dto.time) : new Date();

    return flight.getPosition(atTime);
  }

  async isFlightInAirspace(
    id: string,
    bottomLeftX: number,
    bottomLeftY: number,
    topRightX: number,
    topRightY: number,
    dto: GetPositionDto
  ): Promise<boolean> {
    const position = await this.getFlightPosition(id, dto);
    const airspace = new Airspace(
      new Coordinate(bottomLeftX, bottomLeftY),
      new Coordinate(topRightX, topRightY)
    );
    return airspace.isWithinAirspace(position);
  }
}
