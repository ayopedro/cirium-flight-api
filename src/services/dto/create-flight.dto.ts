import { IsString, IsDateString, IsNotEmpty } from 'class-validator';

export class CreateFlightDto {
  @IsString()
  @IsNotEmpty()
  arrivalAerodrome!: string;

  @IsDateString()
  @IsNotEmpty()
  arrivalTime!: string;

  @IsString()
  @IsNotEmpty()
  departureAerodrome!: string;

  @IsDateString()
  @IsNotEmpty()
  departureTime!: string;
}
