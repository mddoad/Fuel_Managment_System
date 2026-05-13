import { IsEnum, IsInt, IsNumber, Min } from 'class-validator';
import { FuelType } from '../fuel-request.entity';

export class CreateFuelRequestDto {
  @IsInt()
  vehicleId!: number;

  @IsInt()
  stationId!: number;

  @IsEnum(FuelType)
  fuelType!: FuelType;

  @IsNumber()
  @Min(0.1)
  amount!: number;
}