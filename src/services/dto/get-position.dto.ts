import { IsOptional, IsDateString } from 'class-validator';

export class GetPositionDto {
  @IsOptional()
  @IsDateString()
  time?: string;
}
