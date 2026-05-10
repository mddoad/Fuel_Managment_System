import { IsDateString, IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString } from 'class-validator';

export class CreateFuelLogDto {
  @IsNumber()
  @IsNotEmpty()
  stationId!: number;

  @IsNumber()
  @IsNotEmpty()
  vehicleId!: number;

  @IsDateString()
  date!: string; // ISO string

  @IsNumber()
  @IsPositive()
  liters!: number;

  @IsNumber()
  @IsPositive()
  pricePerLiter!: number;

  @IsNumber()
  @IsPositive()
  totalCost!: number;

  @IsNumber()
  @IsOptional()
  meterReading?: number;

  @IsString()
  @IsOptional()
  note?: string;
}