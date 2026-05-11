import { IsEmail, IsNotEmpty, IsString, Matches, MinLength } from 'class-validator';

export class RegisterDistributorDto {
  @IsString()
  @IsNotEmpty()
  ownerName!: string;

  @Matches(/^(\+8801|01)[3-9]\d{8}$/, {
    message: 'Owner phone must be a valid Bangladesh number (01XXXXXXXXX or +8801XXXXXXXXX)',
  })
  ownerPhone!: string;

  @IsString()
  @IsNotEmpty()
  stationName!: string;

  @Matches(/^(\+8801|01)[3-9]\d{8}$/, {
    message: 'Station phone must be a valid Bangladesh number (01XXXXXXXXX or +8801XXXXXXXXX)',
  })
  stationPhone!: string;

  @IsString()
  @IsNotEmpty()
  address!: string;

  @IsEmail({}, { message: 'Email must be valid' })
  email!: string;

  @MinLength(8)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).+$/, {
    message: 'Password must contain uppercase, lowercase, number, and special character',
  })
  password!: string;

  @IsString()
  @IsNotEmpty()
  confirmPassword!: string;
}