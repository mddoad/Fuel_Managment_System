import { IsArray, IsEnum, IsNumber, Min, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { FuelType } from '../fuel-price.entity';

class FuelPriceItemDto {
  @IsEnum(FuelType)
  fuelType!: FuelType;

  @IsNumber()
  @Min(0)
  pricePerUnit!: number;
}

export class SetFuelPricesDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FuelPriceItemDto)
  items!: FuelPriceItemDto[];
}