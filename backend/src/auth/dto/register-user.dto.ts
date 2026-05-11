import {
  IsDateString,
  IsEmail,
  IsNotEmpty,
  IsString,
  Matches,
  MinLength,
} from 'class-validator';

export class RegisterUserDto {
  @IsString()
  @IsNotEmpty()
  fullName!: string;

  @IsEmail()
  email!: string;

  
  @Matches(/^(\+8801|01)[3-9]\d{8}$/, {
    message: 'Phone must be a valid Bangladesh number (01XXXXXXXXX or +8801XXXXXXXXX)',
  })
  phone!: string;

  @IsDateString()
  dob!: string;

  @MinLength(8)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).+$/, {
    message: 'Password must contain uppercase, lowercase, number, and special character',
  })
  password!: string;

  @IsString()
  @IsNotEmpty()
  confirmPassword!: string;
}