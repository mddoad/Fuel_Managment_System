import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsNumber, Min } from 'class-validator';
import { FuelType } from '../fuel-request.entity';

export class CreateFuelRequestDto {
  @Type(() => Number)
  @IsInt()
  vehicleId!: number;

  @Type(() => Number)
  @IsInt()
  stationId!: number;

  @IsEnum(FuelType)
  fuelType!: FuelType;

  @Type(() => Number)
  @IsNumber()
  @Min(0.1)
  amount!: number;
}