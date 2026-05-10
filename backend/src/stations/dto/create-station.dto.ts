import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateStationDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  @IsOptional()
  address?: string;
}