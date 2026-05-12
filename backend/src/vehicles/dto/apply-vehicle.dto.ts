import { IsNotEmpty, IsString, Matches } from 'class-validator';

export class ApplyVehicleDto {
  @IsString()
  @IsNotEmpty()
  type!: string;

  
  @Matches(/^[A-Z0-9\- ]{5,30}$/i, {
    message: 'Vehicle number looks invalid',
  })
  plateNumber!: string;

  @IsString()
  @IsNotEmpty()
  ownerName!: string;

  @Matches(/^(\+8801|01)[3-9]\d{8}$/, {
    message: 'Owner phone must be a valid Bangladesh number (01XXXXXXXXX or +8801XXXXXXXXX)',
  })
  ownerPhone!: string;
}