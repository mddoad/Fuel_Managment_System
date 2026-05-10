import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateVehicleDto {
  @IsString()
  @IsNotEmpty()
  plateNumber!: string;

  @IsString()
  @IsOptional()
  type?: string;
}